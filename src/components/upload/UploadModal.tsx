import { useState, useRef, FormEvent, ChangeEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSpace } from '../../context/SpaceContext'
import { compressImage, validateImage } from '../../utils/imageHelpers'
import { uploadImage } from '../../services/storage.service'
import { createPost } from '../../services/posts.service'
import ImagePreview from './ImagePreview'
import { Button } from '../ui/button'
import { Label } from '../ui/label'

interface UploadModalProps {
  onClose: () => void
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const { currentUser, userProfile } = useAuth()
  const { currentSpace } = useSpace()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !currentUser || !userProfile || !currentSpace) {
      if (!currentSpace) {
        setError('No space selected')
      }
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      // Compress image
      const compressedBlob = await compressImage(selectedFile)

      // Generate unique post ID
      const postId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Upload to Firebase Storage
      const { url, path } = await uploadImage(
        currentSpace.id,
        currentUser.uid,
        postId,
        compressedBlob,
        (progress) => setUploadProgress(progress)
      )

      // Create post document
      await createPost(
        currentSpace.id,
        currentUser.uid,
        userProfile.username,
        userProfile.displayName,
        url,
        path,
        caption.trim()
      )

      onClose()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !uploading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upload Photo</h2>
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600 mb-2">Click to select a photo</p>
                <p className="text-sm text-gray-400">Max 10MB</p>
              </div>
            ) : (
              <ImagePreview
                file={selectedFile}
                previewUrl={previewUrl!}
                onRemove={handleRemoveImage}
              />
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div>
              <Label htmlFor="caption" className="text-gray-700 mb-2">
                Caption
              </Label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none mt-2"
                placeholder="Write a caption..."
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {caption.length} / 500
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {uploading && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={uploading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
