import { Timestamp } from 'firebase/firestore'

export interface Post {
  id: string
  spaceId: string // Space this post belongs to
  userId: string
  username: string
  displayName: string
  imageUrl: string
  imagePath: string // Format: spaces/{spaceId}/posts/{userId}/{postId}.jpg
  caption: string
  createdAt: Timestamp
}
