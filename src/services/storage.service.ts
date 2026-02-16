import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot
} from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload image to Firebase Storage in a space
 * Returns a promise that resolves with the download URL
 */
export async function uploadImage(
  spaceId: string,
  userId: string,
  postId: string,
  file: Blob,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  const path = `spaces/${spaceId}/posts/${userId}/${postId}.jpg`
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
          resolve({ url, path })
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

/**
 * Delete image from Firebase Storage
 */
export async function deleteImage(imagePath: string): Promise<void> {
  const storageRef = ref(storage, imagePath)
  await deleteObject(storageRef)
}
