import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile, uploadProfilePhoto } from '../../services/profile.service'
import { compressImage, validateImage } from '../../utils/imageHelpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  const { currentUser, userProfile } = useAuth()
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!currentUser || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <p className="text-center text-gray-600">Please log in to view your profile.</p>
      </div>
    )
  }

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
    setError('')
    setSuccess('')
    setUploading(true)
    setUploadProgress(0)

    try {
      const updates: { displayName?: string; profilePhotoUrl?: string } = {}

      // Update display name if changed
      if (displayName.trim() && displayName !== userProfile.displayName) {
        updates.displayName = displayName.trim()
      }

      // Upload profile photo if selected
      if (selectedFile) {
        const compressedBlob = await compressImage(selectedFile)
        const photoUrl = await uploadProfilePhoto(
          currentUser.uid,
          compressedBlob,
          (progress) => setUploadProgress(progress)
        )
        updates.profilePhotoUrl = photoUrl
      }

      // Update profile if there are changes
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(currentUser.uid, updates)
        setSuccess('Profile updated successfully!')
        handleRemoveImage()

        // Reload page to refresh profile data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError('No changes to save')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setUploading(false)
    }
  }

  const currentPhotoUrl = previewUrl || userProfile.profilePhotoUrl

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div>
            <Label className="mb-3">Profile Photo</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">
                    {userProfile.displayName[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    {currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {(previewUrl || selectedFile) && (
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or GIF. Max 10MB.
                </p>
              </div>
            </div>
          </div>

          {/* Display Name Section */}
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="Your display name"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how your name will appear on posts and comments.
            </p>
          </div>

          {/* Username (Read-only) */}
          <div>
            <Label>Username</Label>
            <Input
              type="text"
              value={userProfile.username}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Your username cannot be changed.
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={uploading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            {uploading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
        </CardContent>
      </Card>
    </div>
  )
}
