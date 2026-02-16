import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from '../types/User'

/**
 * Check if a username is already taken
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const usernameQuery = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase().trim())
  )
  const snapshot = await getDocs(usernameQuery)
  return snapshot.empty
}

/**
 * Sign up a new user with email, password, username, and display name
 */
export async function signup(
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<FirebaseUser> {
  // Check if username is available
  const isAvailable = await checkUsernameAvailable(username)
  if (!isAvailable) {
    throw new Error('Username is already taken')
  }

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Create user profile in Firestore
  const userProfile: Omit<User, 'uid'> = {
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    displayName,
    createdAt: Timestamp.now(),
    spaceIds: [],
  }

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    ...userProfile,
  })

  return user
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  await signOut(auth)
}

/**
 * Get current user's profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) {
    return userDoc.data() as User
  }
  return null
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}
