import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage'
import { db, storage } from './firebase'

/**
 * Update user profile (display name and/or profile photo URL)
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string
    profilePhotoUrl?: string
  }
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), updates)
}

/**
 * Upload profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(
  userId: string,
  file: Blob,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `profile-photos/${userId}.jpg`
  const storageRef = ref(storage, path)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'image/jpeg'
    })

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      (error) => {
        reject(error)
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}
