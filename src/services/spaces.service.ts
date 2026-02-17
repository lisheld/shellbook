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
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { Space, SpaceMember } from '../types/Space'

/**
 * Create a new space with the creator as leader
 */
export async function createSpace(
  creatorId: string,
  creatorUsername: string,
  creatorDisplayName: string,
  name: string,
  description?: string
): Promise<string> {
  const creatorMember: SpaceMember = {
    uid: creatorId,
    username: creatorUsername,
    displayName: creatorDisplayName,
    role: 'leader',
    joinedAt: Timestamp.now(),
  }

  const spaceData = {
    name,
    description: description || '',
    creatorId,
    createdAt: Timestamp.now(),
    members: [creatorMember],
    settings: {
      isPrivate: true,
      allowMemberInvites: false,
    },
  }

  const docRef = await addDoc(collection(db, 'spaces'), spaceData)

  // Add space ID to user's spaceIds array
  const userRef = doc(db, 'users', creatorId)
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) {
    const currentSpaceIds = userDoc.data().spaceIds || []
    await updateDoc(userRef, {
      spaceIds: [...currentSpaceIds, docRef.id],
    })
  }

  return docRef.id
}

/**
 * Get all spaces a user belongs to
 */
export async function getUserSpaces(userId: string): Promise<Space[]> {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    return []
  }

  const spaceIds = userDoc.data().spaceIds || []
  if (spaceIds.length === 0) {
    return []
  }

  // Fetch all spaces the user belongs to
  const spaces: Space[] = []
  for (const spaceId of spaceIds) {
    const spaceRef = doc(db, 'spaces', spaceId)
    const spaceDoc = await getDoc(spaceRef)
    if (spaceDoc.exists()) {
      spaces.push({
        id: spaceDoc.id,
        ...spaceDoc.data(),
      } as Space)
    }
  }

  return spaces
}

/**
 * Subscribe to real-time updates for a specific space
 */
export function subscribeToSpace(
  spaceId: string,
  callback: (space: Space | null) => void
): () => void {
  const spaceRef = doc(db, 'spaces', spaceId)

  return onSnapshot(spaceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data(),
      } as Space)
    } else {
      callback(null)
    }
  })
}

/**
 * Add a member to a space
 */
export async function addMemberToSpace(
  spaceId: string,
  userId: string,
  username: string,
  displayName: string,
  role: 'admin' | 'member' = 'member'
): Promise<void> {
  const batch = writeBatch(db)

  // Add member to space
  const spaceRef = doc(db, 'spaces', spaceId)
  const spaceDoc = await getDoc(spaceRef)

  if (!spaceDoc.exists()) {
    throw new Error('Space not found')
  }

  const space = spaceDoc.data() as Space
  const newMember: SpaceMember = {
    uid: userId,
    username,
    displayName,
    role,
    joinedAt: Timestamp.now(),
  }

  batch.update(spaceRef, {
    members: [...space.members, newMember],
  })

  // Add space ID to user's spaceIds
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) {
    const currentSpaceIds = userDoc.data().spaceIds || []
    batch.update(userRef, {
      spaceIds: [...currentSpaceIds, spaceId],
    })
  }

  await batch.commit()
}

/**
 * Remove a member from a space
 * If last member, delete the space
 */
export async function removeMemberFromSpace(
  spaceId: string,
  userId: string
): Promise<void> {
  const batch = writeBatch(db)

  const spaceRef = doc(db, 'spaces', spaceId)
  const spaceDoc = await getDoc(spaceRef)

  if (!spaceDoc.exists()) {
    throw new Error('Space not found')
  }

  const space = spaceDoc.data() as Space
  const updatedMembers = space.members.filter((m) => m.uid !== userId)

  // If this was the last member, delete the space entirely
  if (updatedMembers.length === 0) {
    await deleteSpaceAndContent(spaceId)
    return
  }

  batch.update(spaceRef, {
    members: updatedMembers,
  })

  // Remove space ID from user's spaceIds
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)
  if (userDoc.exists()) {
    const currentSpaceIds = userDoc.data().spaceIds || []
    batch.update(userRef, {
      spaceIds: currentSpaceIds.filter((id: string) => id !== spaceId),
    })
  }

  await batch.commit()
}

/**
 * User leaves a space
 * If last member, delete the space
 */
export async function leaveSpace(spaceId: string, userId: string): Promise<void> {
  await removeMemberFromSpace(spaceId, userId)
}

/**
 * Delete a space and all its content (posts, comments, images)
 * Only callable by space leader
 */
export async function deleteSpaceAndContent(spaceId: string): Promise<void> {
  try {
    console.log('Starting space deletion for:', spaceId)

    // Delete all posts in the space
    console.log('Deleting posts...')
    const postsQuery = query(collection(db, 'posts'), where('spaceId', '==', spaceId))
    const postsSnapshot = await getDocs(postsQuery)
    console.log(`Found ${postsSnapshot.size} posts to delete`)
    for (const postDoc of postsSnapshot.docs) {
      await deleteDoc(postDoc.ref)
    }
    console.log('Posts deleted successfully')

    // Delete all comments in the space
    console.log('Deleting comments...')
    const commentsQuery = query(collection(db, 'comments'), where('spaceId', '==', spaceId))
    const commentsSnapshot = await getDocs(commentsQuery)
    console.log(`Found ${commentsSnapshot.size} comments to delete`)
    for (const commentDoc of commentsSnapshot.docs) {
      await deleteDoc(commentDoc.ref)
    }
    console.log('Comments deleted successfully')

    // Delete all invitations for the space
    console.log('Deleting invitations...')
    const invitationsQuery = query(collection(db, 'invitations'), where('spaceId', '==', spaceId))
    const invitationsSnapshot = await getDocs(invitationsQuery)
    console.log(`Found ${invitationsSnapshot.size} invitations to delete`)
    for (const invitationDoc of invitationsSnapshot.docs) {
      await deleteDoc(invitationDoc.ref)
    }
    console.log('Invitations deleted successfully')

    // Delete the space itself
    console.log('Deleting space document...')
    const spaceRef = doc(db, 'spaces', spaceId)
    await deleteDoc(spaceRef)
    console.log('Space deleted successfully')

  } catch (error) {
    console.error('Error during space deletion:', error)
    throw error
  }

  // Note: We don't remove spaceIds from users' profiles
  // The getUserSpaces function already handles non-existent spaces gracefully
}

/**
 * Update space settings
 */
export async function updateSpaceSettings(
  spaceId: string,
  settings: { isPrivate?: boolean; allowMemberInvites?: boolean }
): Promise<void> {
  const spaceRef = doc(db, 'spaces', spaceId)
  const spaceDoc = await getDoc(spaceRef)

  if (!spaceDoc.exists()) {
    throw new Error('Space not found')
  }

  const space = spaceDoc.data() as Space
  await updateDoc(spaceRef, {
    settings: {
      ...space.settings,
      ...settings,
    },
  })
}
