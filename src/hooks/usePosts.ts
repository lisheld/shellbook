import { useState, useEffect } from 'react'
import { Post } from '../types/Post'
import { subscribeToPosts } from '../services/posts.service'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = subscribeToPosts((newPosts) => {
        setPosts(newPosts)
        setLoading(false)
      })

      return unsubscribe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      setLoading(false)
    }
  }, [])

  return { posts, loading, error }
}
