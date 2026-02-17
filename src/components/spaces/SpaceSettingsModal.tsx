import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSpace } from '../../context/SpaceContext'
import { Space, SpaceMember } from '../../types/Space'
import { subscribeToSpace, removeMemberFromSpace, deleteSpaceAndContent } from '../../services/spaces.service'
import InviteMemberModal from './InviteMemberModal'
import { Button } from '../ui/button'

interface SpaceSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  spaceId: string
}

export default function SpaceSettingsModal({
  isOpen,
  onClose,
  spaceId,
}: SpaceSettingsModalProps) {
  const { currentUser } = useAuth()
  const { refreshSpaces } = useSpace()
  const navigate = useNavigate()
  const [space, setSpace] = useState<Space | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [deletingSpace, setDeletingSpace] = useState(false)

  useEffect(() => {
    if (!isOpen || !spaceId) return

    const unsubscribe = subscribeToSpace(spaceId, (spaceData) => {
      setSpace(spaceData)
    })

    return unsubscribe
  }, [isOpen, spaceId])

  const isLeader = space?.members.some(
    (m) => m.uid === currentUser?.uid && m.role === 'leader'
  )

  const handleRemoveMember = async (member: SpaceMember) => {
    if (!confirm(`Remove ${member.displayName} from this space?`)) return

    setRemovingMemberId(member.uid)
    try {
      await removeMemberFromSpace(spaceId, member.uid)
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member. Please try again.')
    } finally {
      setRemovingMemberId(null)
    }
  }

  const handleDeleteSpace = async () => {
    if (!confirm(
      `Are you sure you want to delete "${space?.name}"?\n\nThis will permanently delete:\n• All photos and posts\n• All comments\n• All member data\n\nThis action cannot be undone.`
    )) return

    setDeletingSpace(true)
    try {
      await deleteSpaceAndContent(spaceId)
      await refreshSpaces()
      onClose()
      navigate('/')
    } catch (error) {
      console.error('Error deleting space:', error)
      alert('Failed to delete space. Please try again.')
      setDeletingSpace(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !space) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Space Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Space Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
              {space.description && (
                <p className="text-gray-600 mt-1">{space.description}</p>
              )}
            </div>

            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Members ({space.members.length})
                </h3>
                {isLeader && (
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                    size="sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Invite Member
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {space.members.map((member) => (
                  <div
                    key={member.uid}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{member.displayName}</p>
                        {member.role === 'leader' && (
                          <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">@{member.username}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(member.joinedAt.toDate()).toLocaleDateString()}
                      </p>
                    </div>

                    {isLeader && member.uid !== currentUser?.uid && (
                      <Button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingMemberId === member.uid}
                        variant="ghost"
                        size="sm"
                        className="ml-4 text-red-600 hover:bg-red-50"
                      >
                        {removingMemberId === member.uid ? 'Removing...' : 'Remove'}
                      </Button>
                    )}

                    {member.uid === currentUser?.uid && member.role !== 'leader' && (
                      <Button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingMemberId === member.uid}
                        variant="ghost"
                        size="sm"
                        className="ml-4 text-gray-600 hover:bg-gray-50"
                      >
                        {removingMemberId === member.uid ? 'Leaving...' : 'Leave Space'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone - Only for Leaders */}
            {isLeader && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-xs text-red-700 mb-3">
                    Deleting this space will permanently remove all photos, posts, and comments. This action cannot be undone.
                  </p>
                  <Button
                    onClick={handleDeleteSpace}
                    disabled={deletingSpace}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    {deletingSpace ? 'Deleting Space...' : 'Delete Space'}
                  </Button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          spaceId={spaceId}
          spaceName={space.name}
        />
      )}
    </>
  )
}
