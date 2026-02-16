import { Timestamp } from 'firebase/firestore'

export interface Comment {
  id: string
  spaceId: string // Space this comment belongs to
  postId: string
  userId: string
  username: string
  displayName: string
  text: string
  createdAt: Timestamp
}
