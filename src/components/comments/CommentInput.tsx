import { useState, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createComment } from '../../services/comments.service'

interface CommentInputProps {
  postId: string
}

export default function CommentInput({ postId }: CommentInputProps) {
  const { currentUser, userProfile } = useAuth()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!text.trim() || !currentUser || !userProfile) return

    setIsSubmitting(true)
    try {
      await createComment(
        postId,
        currentUser.uid,
        userProfile.username,
        userProfile.displayName,
        text.trim()
      )
      setText('')
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-gray-100">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        maxLength={500}
        disabled={isSubmitting}
        className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-valentine-pink focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={!text.trim() || isSubmitting}
        className="text-sm font-semibold text-valentine-red hover:text-valentine-pink transition-colors disabled:text-gray-300 disabled:cursor-not-allowed px-3"
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}
