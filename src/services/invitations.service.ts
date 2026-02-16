import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { Invitation } from '../types/Invitation'
import { addMemberToSpace } from './spaces.service'

/**
 * Check if a username exists in the users collection
 */
async function checkUsernameExists(username: string): Promise<{
  exists: boolean
  userId?: string
  displayName?: string
}> {
  const usersQuery = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase().trim())
  )
  const snapshot = await getDocs(usersQuery)

  if (snapshot.empty) {
    return { exists: false }
  }

  const userData = snapshot.docs[0].data()
  return {
    exists: true,
    userId: snapshot.docs[0].id,
    displayName: userData.displayName,
  }
}

/**
 * Invite a user to a space by username
 * Validates that the user exists first
 */
export async function inviteUserToSpace(
  spaceId: string,
  spaceName: string,
  invitedByUid: string,
  invitedByUsername: string,
  targetUsername: string
): Promise<void> {
  // Check if user exists
  const userCheck = await checkUsernameExists(targetUsername)

  if (!userCheck.exists) {
    throw new Error(`User "${targetUsername}" not found`)
  }

  // Check if user is already a member
  const spaceRef = doc(db, 'spaces', spaceId)
  const spaceDoc = await getDoc(spaceRef)

  if (!spaceDoc.exists()) {
    throw new Error('Space not found')
  }

  const space = spaceDoc.data()
  const isMember = space.members.some((m: any) => m.uid === userCheck.userId)

  if (isMember) {
    throw new Error('User is already a member of this space')
  }

  // Check if there's already a pending invitation
  const existingInvitationsQuery = query(
    collection(db, 'invitations'),
    where('spaceId', '==', spaceId),
    where('invitedUsername', '==', targetUsername.toLowerCase().trim()),
    where('status', '==', 'pending')
  )
  const existingSnapshot = await getDocs(existingInvitationsQuery)

  if (!existingSnapshot.empty) {
    throw new Error('An invitation is already pending for this user')
  }

  // Create invitation
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days

  await addDoc(collection(db, 'invitations'), {
    spaceId,
    spaceName,
    invitedBy: invitedByUid,
    invitedByUsername,
    invitedUsername: targetUsername.toLowerCase().trim(),
    status: 'pending',
    createdAt: Timestamp.now(),
    expiresAt,
  })
}

/**
 * Get all pending invitations for a user by username
 */
export async function getUserInvitations(username: string): Promise<Invitation[]> {
  const invitationsQuery = query(
    collection(db, 'invitations'),
    where('invitedUsername', '==', username.toLowerCase().trim()),
    where('status', '==', 'pending')
  )

  const snapshot = await getDocs(invitationsQuery)

  const invitations: Invitation[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    // Filter out expired invitations
    if (data.expiresAt.toMillis() > Date.now()) {
      invitations.push({
        id: doc.id,
        ...data,
      } as Invitation)
    }
  })

  return invitations
}

/**
 * Subscribe to real-time updates for user's invitations
 */
export function subscribeToUserInvitations(
  username: string,
  callback: (invitations: Invitation[]) => void
): () => void {
  const invitationsQuery = query(
    collection(db, 'invitations'),
    where('invitedUsername', '==', username.toLowerCase().trim()),
    where('status', '==', 'pending')
  )

  return onSnapshot(invitationsQuery, (snapshot) => {
    const invitations: Invitation[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Filter out expired invitations
      if (data.expiresAt.toMillis() > Date.now()) {
        invitations.push({
          id: doc.id,
          ...data,
        } as Invitation)
      }
    })
    callback(invitations)
  })
}

/**
 * Accept an invitation and join the space
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string,
  username: string,
  displayName: string
): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId)
  const invitationDoc = await getDoc(invitationRef)

  if (!invitationDoc.exists()) {
    throw new Error('Invitation not found')
  }

  const invitation = invitationDoc.data() as Invitation

  // Check if invitation has expired
  if (invitation.expiresAt.toMillis() < Date.now()) {
    await updateDoc(invitationRef, {
      status: 'expired',
    })
    throw new Error('Invitation has expired')
  }

  // Add user to space
  await addMemberToSpace(invitation.spaceId, userId, username, displayName)

  // Update invitation status
  await updateDoc(invitationRef, {
    status: 'accepted',
    acceptedAt: Timestamp.now(),
  })
}

/**
 * Decline an invitation
 */
export async function declineInvitation(invitationId: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId)
  await updateDoc(invitationRef, {
    status: 'declined',
  })
}

/**
 * Cancel a sent invitation (by sender only)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId)
  await deleteDoc(invitationRef)
}
