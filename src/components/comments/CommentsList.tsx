import { useState, useEffect } from 'react'
import { Comment } from '../../types/Comment'
import { subscribeToComments } from '../../services/comments.service'
import CommentItem from './CommentItem'
import CommentInput from './CommentInput'

interface CommentsListProps {
  postId: string
}

export default function CommentsList({ postId }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, (newComments) => {
      setComments(newComments)
      setLoading(false)
    })

    return unsubscribe
  }, [postId])

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-400">
        Loading comments...
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100">
      {comments.length > 0 && (
        <div className="px-4 pt-3">
          {comments.length > 2 && !isExpanded ? (
            <>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                View all {comments.length} comments
              </button>
              <div className="space-y-1">
                {comments.slice(-2).map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-1">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="px-4 pb-3">
        <CommentInput postId={postId} />
      </div>
    </div>
  )
}
