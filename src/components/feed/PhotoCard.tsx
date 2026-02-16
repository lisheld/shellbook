import { useState, useEffect } from 'react'
import { Post } from '../../types/Post'
import { formatTime } from '../../utils/dateHelpers'
import { useAuth } from '../../hooks/useAuth'
import { deletePost } from '../../services/posts.service'
import { deleteImage } from '../../services/storage.service'
import { getUserProfile } from '../../services/auth.service'
import ConfirmModal from '../common/ConfirmModal'
import CommentsList from '../comments/CommentsList'
import Avatar from '../common/Avatar'

interface PhotoCardProps {
  post: Post
}

export default function PhotoCard({ post }: PhotoCardProps) {
  const { currentUser } = useAuth()
  const time = formatTime(post.createdAt.toDate())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>()

  const isOwner = currentUser?.uid === post.userId

  useEffect(() => {
    // Fetch profile photo for post owner
    getUserProfile(post.userId).then(profile => {
      if (profile?.profilePhotoUrl) {
        setProfilePhotoUrl(profile.profilePhotoUrl)
      }
    })
  }, [post.userId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Delete the image from storage
      await deleteImage(post.imagePath)
      // Delete the post document
      await deletePost(post.id)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar displayName={post.displayName} profilePhotoUrl={profilePhotoUrl} />
              <div>
                <p className="font-semibold text-gray-800">{post.displayName}</p>
                <p className="text-xs text-gray-500">{time}</p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                aria-label="Delete post"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        {post.caption && (
          <div className="p-4 pb-2">
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              <span className="font-semibold">{post.displayName}</span> {post.caption}
            </p>
          </div>
        )}

        <CommentsList postId={post.id} />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  )
}
