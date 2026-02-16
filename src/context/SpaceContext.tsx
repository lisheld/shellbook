import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Space } from '../types/Space'
import { getUserSpaces, subscribeToSpace, createSpace as createSpaceService } from '../services/spaces.service'
import { useAuth } from '../hooks/useAuth'

interface SpaceContextType {
  currentSpace: Space | null
  userSpaces: Space[]
  switchSpace: (spaceId: string) => void
  createSpace: (name: string, description?: string) => Promise<string>
  refreshSpaces: () => Promise<void>
  loading: boolean
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined)

export function SpaceProvider({ children }: { children: ReactNode }) {
  const { currentUser, userProfile } = useAuth()
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null)
  const [userSpaces, setUserSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  // Load user's spaces
  const loadSpaces = async () => {
    if (!currentUser) {
      setUserSpaces([])
      setCurrentSpace(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const spaces = await getUserSpaces(currentUser.uid)
      setUserSpaces(spaces)

      // If no current space, set to first space or null
      if (!currentSpace && spaces.length > 0) {
        setCurrentSpace(spaces[0])
      } else if (currentSpace) {
        // Update current space if it's in the list
        const updatedCurrentSpace = spaces.find((s) => s.id === currentSpace.id)
        if (updatedCurrentSpace) {
          setCurrentSpace(updatedCurrentSpace)
        } else if (spaces.length > 0) {
          // Current space no longer exists, switch to first available
          setCurrentSpace(spaces[0])
        } else {
          setCurrentSpace(null)
        }
      }
    } catch (error) {
      console.error('Error loading spaces:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load spaces when user changes
  useEffect(() => {
    loadSpaces()
  }, [currentUser?.uid])

  // Subscribe to current space updates
  useEffect(() => {
    if (!currentSpace) return

    const unsubscribe = subscribeToSpace(currentSpace.id, (space) => {
      if (space) {
        setCurrentSpace(space)
        // Update in userSpaces array as well
        setUserSpaces((prev) =>
          prev.map((s) => (s.id === space.id ? space : s))
        )
      } else {
        // Space was deleted
        setCurrentSpace(null)
        loadSpaces()
      }
    })

    return unsubscribe
  }, [currentSpace?.id])

  const switchSpace = (spaceId: string) => {
    const space = userSpaces.find((s) => s.id === spaceId)
    if (space) {
      setCurrentSpace(space)
      // Save to localStorage for persistence
      localStorage.setItem('lastSpaceId', spaceId)
    }
  }

  const createSpace = async (name: string, description?: string): Promise<string> => {
    if (!currentUser || !userProfile) {
      throw new Error('User not authenticated')
    }

    const spaceId = await createSpaceService(
      currentUser.uid,
      userProfile.username,
      userProfile.displayName,
      name,
      description
    )

    // Reload spaces to include the new one
    await loadSpaces()

    // Switch to the new space
    switchSpace(spaceId)

    return spaceId
  }

  const refreshSpaces = async () => {
    await loadSpaces()
  }

  return (
    <SpaceContext.Provider
      value={{
        currentSpace,
        userSpaces,
        switchSpace,
        createSpace,
        refreshSpaces,
        loading,
      }}
    >
      {children}
    </SpaceContext.Provider>
  )
}

export function useSpace() {
  const context = useContext(SpaceContext)
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider')
  }
  return context
}
