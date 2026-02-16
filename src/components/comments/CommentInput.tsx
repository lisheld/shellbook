import { useState, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSpace } from '../../context/SpaceContext'
import { createComment } from '../../services/comments.service'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface CommentInputProps {
  postId: string
}

export default function CommentInput({ postId }: CommentInputProps) {
  const { currentUser, userProfile } = useAuth()
  const { currentSpace } = useSpace()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!text.trim() || !currentUser || !userProfile || !currentSpace) return

    setIsSubmitting(true)
    try {
      await createComment(
        currentSpace.id,
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
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        maxLength={500}
        disabled={isSubmitting}
        className="flex-1 text-sm rounded-full focus-visible:ring-gray-900"
      />
      <Button
        type="submit"
        disabled={!text.trim() || isSubmitting}
        variant="ghost"
        className="text-sm font-semibold text-gray-900 hover:text-gray-700 hover:bg-gray-100 px-3"
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </form>
  )
}
