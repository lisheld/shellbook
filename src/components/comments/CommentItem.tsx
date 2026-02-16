import { useState, useEffect } from 'react'
import { Comment } from '../../types/Comment'
import { formatTime } from '../../utils/dateHelpers'
import { useAuth } from '../../hooks/useAuth'
import { deleteComment } from '../../services/comments.service'
import { getUserProfile } from '../../services/auth.service'
import Avatar from '../common/Avatar'

interface CommentItemProps {
  comment: Comment
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { currentUser } = useAuth()
  const time = formatTime(comment.createdAt.toDate())
  const [isDeleting, setIsDeleting] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>()

  const isOwner = currentUser?.uid === comment.userId

  useEffect(() => {
    // Fetch profile photo for comment author
    getUserProfile(comment.userId).then(profile => {
      if (profile?.profilePhotoUrl) {
        setProfilePhotoUrl(profile.profilePhotoUrl)
      }
    })
  }, [comment.userId])

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return

    setIsDeleting(true)
    try {
      await deleteComment(comment.id)
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-2 py-2">
      <Avatar displayName={comment.displayName} profilePhotoUrl={profilePhotoUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold text-gray-800">{comment.displayName}</span>{' '}
              <span className="text-gray-700">{comment.text}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{time}</p>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500 transition-colors text-xs p-1"
              aria-label="Delete comment"
            >
              {isDeleting ? '...' : '×'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
