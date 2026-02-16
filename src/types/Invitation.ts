import { Timestamp } from 'firebase/firestore'

export interface Invitation {
  id: string
  spaceId: string
  spaceName: string // Denormalized for display
  invitedBy: string // User UID
  invitedByUsername: string // For display
  invitedUsername: string // Target username to match
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: Timestamp
  expiresAt: Timestamp // Auto-expire after 7 days
  acceptedAt?: Timestamp
}
