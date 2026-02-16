import { useState, useEffect } from 'react'
import { Post } from '../types/Post'
import { subscribeToPosts } from '../services/posts.service'

export function usePosts(spaceId: string | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!spaceId) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      const unsubscribe = subscribeToPosts(spaceId, (newPosts) => {
        setPosts(newPosts)
        setLoading(false)
      })

      return unsubscribe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      setLoading(false)
    }
  }, [spaceId])

  return { posts, loading, error }
}
