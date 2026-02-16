import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  username: string // Unique username for invitations
  email: string // User's email
  displayName: string // User's display name
  profilePhotoUrl?: string // Optional profile photo URL
  createdAt: Timestamp
  spaceIds: string[] // Array of space IDs user belongs to
}
