import { useState, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { inviteUserToSpace } from '../../services/invitations.service'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  spaceId: string
  spaceName: string
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
}: InviteMemberModalProps) {
  const { currentUser, userProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !currentUser || !userProfile) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await inviteUserToSpace(
        spaceId,
        spaceName,
        currentUser.uid,
        userProfile.username,
        username.trim()
      )
      setSuccess(true)
      setUsername('')
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Invite error:', err)
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Invite Member</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Invite a user to <span className="font-semibold">{spaceName}</span> by their username.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-gray-700 mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="johndoe"
                maxLength={20}
                disabled={loading}
                className="w-full mt-2 focus-visible:ring-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Only letters, numbers, and underscores
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Invitation sent successfully!
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!username.trim() || loading}
                className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
