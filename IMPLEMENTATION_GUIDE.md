# ShellBook Implementation Guide

This document tracks the implementation progress of forking vday2026 to shellbook with spaces/workspaces functionality.

## ✅ Completed (100% Backend, ~40% Frontend)

### Backend Infrastructure
- [x] Project forked from vday2026 to shellbook
- [x] Firebase project configured (shellbook-7876d)
- [x] Type definitions updated for spaces
  - [x] User type with spaceIds array
  - [x] Space and SpaceMember types
  - [x] Invitation type
  - [x] Post and Comment with spaceId fields
- [x] All services updated
  - [x] Auth: email/password signup with username validation
  - [x] Spaces: CRUD operations, member management, auto-delete on last member leave
  - [x] Invitations: send/accept/decline by username
  - [x] Posts: space-filtered queries
  - [x] Comments: space-filtered queries
  - [x] Storage: updated paths with spaceId
- [x] SpaceContext created for managing current space state
- [x] Firebase security rules deployed
  - [x] Firestore rules with space-based access control
  - [x] Storage rules with new paths
  - [x] Compound indexes deployed
- [x] shadcn/ui configured

### Frontend Components
- [x] SignUp form (email/password/username/displayName)
- [x] LoginForm updated to use email
- [x] CreateFirstSpace component
- [x] App.tsx routing updated with SpaceProvider

## 📋 Remaining Work

### 1. Update Existing Components for Spaces

#### PhotoFeed Component
**File:** `src/components/feed/PhotoFeed.tsx`

**Changes needed:**
```typescript
import { useSpace } from '../../context/SpaceContext'

export default function PhotoFeed() {
  const { currentSpace, loading: spaceLoading } = useSpace()
  const { posts, loading, error } = usePosts()

  // Add check for currentSpace
  if (!currentSpace) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No space selected. Please create or select a space.</p>
        <button onClick={() => navigate('/create-first-space')}>
          Create Your First Space
        </button>
      </div>
    )
  }

  // Update usePosts to pass spaceId
  // Change: usePosts() → usePosts(currentSpace.id)
}
```

#### usePosts Hook
**File:** `src/hooks/usePosts.ts`

**Changes needed:**
```typescript
export function usePosts(spaceId: string) {  // Add spaceId parameter
  useEffect(() => {
    if (!spaceId) return  // Guard clause

    const unsubscribe = subscribeToPosts(spaceId, (posts) => {
      setPosts(posts)
      setLoading(false)
    })
    return unsubscribe
  }, [spaceId])  // Add to dependencies
}
```

#### Upload Modal
**File:** `src/components/upload/UploadModal.tsx`

**Changes needed:**
```typescript
import { useSpace } from '../../context/SpaceContext'

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { currentSpace } = useSpace()
  const { currentUser, userProfile } = useAuth()

  const handleUpload = async () => {
    if (!currentSpace) {
      setError('No space selected')
      return
    }

    // Update uploadImage call to include spaceId
    const { url, path } = await uploadImage(
      currentSpace.id,  // Add this
      currentUser!.uid,
      postId,
      compressedBlob,
      (progress) => setUploadProgress(progress)
    )

    // Update createPost call to include spaceId
    await createPost(
      currentSpace.id,  // Add this
      currentUser!.uid,
      userProfile!.username,
      userProfile!.displayName,
      url,
      path,
      caption
    )
  }
}
```

#### CommentsList Component
**File:** `src/components/comments/CommentsList.tsx`

**Changes needed:**
```typescript
import { useSpace } from '../../context/SpaceContext'

export default function CommentsList({ postId }: CommentsListProps) {
  const { currentSpace } = useSpace()

  useEffect(() => {
    if (!currentSpace) return

    // Update subscribeToComments to include spaceId
    const unsubscribe = subscribeToComments(
      currentSpace.id,  // Add this
      postId,
      (comments) => setComments(comments)
    )
    return unsubscribe
  }, [postId, currentSpace?.id])  // Update dependencies
}
```

#### CommentInput Component
**File:** `src/components/comments/CommentInput.tsx`

**Changes needed:**
```typescript
import { useSpace } from '../../context/SpaceContext'

export default function CommentInput({ postId }: CommentInputProps) {
  const { currentSpace } = useSpace()
  const { currentUser, userProfile } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!currentSpace) return

    await createComment(
      currentSpace.id,  // Add this
      postId,
      currentUser!.uid,
      userProfile!.username,
      userProfile!.displayName,
      text
    )
  }
}
```

#### Header Component
**File:** `src/components/layout/Header.tsx`

**Changes needed:**
1. Remove "About" link (already done in plan)
2. Add Space Switcher component
3. Update styling to remove Valentine's colors

```typescript
import { useSpace } from '../../context/SpaceContext'
import SpaceSwitcher from '../spaces/SpaceSwitcher'

export default function Header() {
  const { currentSpace } = useSpace()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">ShellBook</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <SpaceSwitcher />  {/* Add this */}
            <Link to="/" className="text-gray-700 hover:text-blue-600...">
              Feed
            </Link>
            {/* Remove About link */}
            <Link to="/profile" className="text-gray-700...">
              Profile
            </Link>
            {/* User greeting and logout */}
          </nav>

          {/* Mobile menu - add SpaceSwitcher here too */}
        </div>
      </div>
    </header>
  )
}
```

### 2. Create New Space Management Components

#### SpaceSwitcher Component
**File:** `src/components/spaces/SpaceSwitcher.tsx`

Create dropdown to show current space and allow switching:
```typescript
import { useSpace } from '../../context/SpaceContext'

export default function SpaceSwitcher() {
  const { currentSpace, userSpaces, switchSpace } = useSpace()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        {currentSpace?.name || 'Select Space'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white...">
          {userSpaces.map(space => (
            <button key={space.id} onClick={() => switchSpace(space.id)}>
              {space.name}
            </button>
          ))}
          <button onClick={() => navigate('/create-space')}>
            + Create New Space
          </button>
        </div>
      )}
    </div>
  )
}
```

#### CreateSpaceModal Component
**File:** `src/components/spaces/CreateSpaceModal.tsx`

Modal for creating additional spaces (reuse CreateFirstSpace logic).

#### InviteMemberModal Component
**File:** `src/components/spaces/InviteMemberModal.tsx`

```typescript
export default function InviteMemberModal({ isOpen, onClose, spaceId, spaceName }) {
  const [username, setUsername] = useState('')
  const { currentUser, userProfile } = useAuth()

  const handleInvite = async () => {
    await inviteUserToSpace(
      spaceId,
      spaceName,
      currentUser!.uid,
      userProfile!.username,
      username
    )
  }
}
```

#### SpaceSettingsModal Component
**File:** `src/components/spaces/SpaceSettingsModal.tsx`

Show space members, allow inviting/removing members.

#### InvitationsList Component
**File:** `src/components/spaces/InvitationsList.tsx`

Show pending invitations with accept/decline buttons.

### 3. Update ProtectedRoute Logic

**File:** `src/components/auth/ProtectedRoute.tsx`

Add logic to check if user has spaces and redirect to create-first-space if needed:

```typescript
import { useSpace } from '../../context/SpaceContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading: authLoading } = useAuth()
  const { userSpaces, loading: spaceLoading } = useSpace()
  const location = useLocation()

  if (authLoading || spaceLoading) {
    return <LoadingSpinner />
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user has no spaces and not on create-first-space page, redirect
  if (userSpaces.length === 0 && location.pathname !== '/create-first-space') {
    return <Navigate to="/create-first-space" replace />
  }

  return <>{children}</>
}
```

### 4. Update Styling (Remove Valentine's Theme)

**File:** `src/index.css`

Replace Valentine's Day colors with neutral shadcn theme:

**Remove:**
```css
--color-valentine-pink: #ff69b4;
--color-valentine-red: #dc143c;
--color-valentine-light-pink: #ffb6c1;
--color-valentine-rose: #ff007f;
```

**Add shadcn variables (search "shadcn css variables" for full list):**
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    /* ... more shadcn variables */
  }
}
```

Update any remaining components using Valentine's colors.

### 5. Testing Checklist

- [ ] Sign up new user
- [ ] Create first space
- [ ] Upload photo in space
- [ ] Add comment
- [ ] Create second space
- [ ] Switch between spaces
- [ ] Invite another user by username
- [ ] Accept invitation (login as other user)
- [ ] View feed in shared space
- [ ] Leave space
- [ ] Verify last member leaving deletes space
- [ ] Test mobile responsive design

### 6. Deployment

```bash
cd /Users/liam/Code/shellbook
npm run build
firebase deploy --only hosting
```

## Key Architecture Decisions

1. **Flat Firestore structure** with spaceId fields instead of nested collections
2. **Space membership** stored as embedded array in Space document (optimized for <100 members)
3. **Invitations by username** - validates user exists before sending
4. **Auto-delete spaces** when last member leaves
5. **Email/password auth** with unique usernames for invitations

## Important Notes

- The SpaceContext loads user spaces on mount and subscribes to currentSpace updates
- Posts/comments queries filter by spaceId at Firestore level (not client-side)
- Storage paths include spaceId: `spaces/{spaceId}/posts/{userId}/{postId}.jpg`
- Firebase security rules check space membership using `isSpaceMember()` helper

## Quick Start for Continued Implementation

1. Run dev server: `npm run dev`
2. Test signup/login flow
3. Implement remaining components in order listed above
4. Test thoroughly before deployment

## Contact

For questions about the implementation, refer to the plan at `.claude/plans/staged-dazzling-peacock.md`.
