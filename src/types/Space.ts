import { Timestamp } from 'firebase/firestore'

export interface Space {
  id: string
  name: string
  description?: string
  creatorId: string // User UID of creator
  createdAt: Timestamp
  members: SpaceMember[] // Embedded array for quick access
  settings?: SpaceSettings
}

export interface SpaceMember {
  uid: string
  username: string
  displayName: string
  role: 'leader' | 'admin' | 'member'
  joinedAt: Timestamp
}

export interface SpaceSettings {
  isPrivate: boolean
  allowMemberInvites: boolean
}
