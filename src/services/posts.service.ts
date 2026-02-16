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
import { Post } from '../types/Post'

/**
 * Create a new post in a space
 */
export async function createPost(
  spaceId: string,
  userId: string,
  username: string,
  displayName: string,
  imageUrl: string,
  imagePath: string,
  caption: string
): Promise<string> {
  const postData = {
    spaceId,
    userId,
    username,
    displayName,
    imageUrl,
    imagePath,
    caption,
    createdAt: Timestamp.now()
  }

  const docRef = await addDoc(collection(db, 'posts'), postData)
  return docRef.id
}

/**
 * Subscribe to posts in a specific space with real-time updates
 * Returns an unsubscribe function
 */
export function subscribeToPosts(
  spaceId: string,
  callback: (posts: Post[]) => void
): () => void {
  const q = query(
    collection(db, 'posts'),
    where('spaceId', '==', spaceId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[]

    callback(posts)
  })
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', postId))
}
