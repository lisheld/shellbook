import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase'
import { Comment } from '../types/Comment'

/**
 * Create a new comment on a post in a space
 */
export async function createComment(
  spaceId: string,
  postId: string,
  userId: string,
  username: string,
  displayName: string,
  text: string
): Promise<string> {
  const commentData = {
    spaceId,
    postId,
    userId,
    username,
    displayName,
    text,
    createdAt: Timestamp.now()
  }

  const docRef = await addDoc(collection(db, 'comments'), commentData)
  return docRef.id
}

/**
 * Subscribe to comments for a specific post with real-time updates
 * Returns an unsubscribe function
 */
export function subscribeToComments(
  spaceId: string,
  postId: string,
  callback: (comments: Comment[]) => void
): () => void {
  const q = query(
    collection(db, 'comments'),
    where('spaceId', '==', spaceId),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const comments: Comment[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[]

    callback(comments)
  })
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', commentId))
}
