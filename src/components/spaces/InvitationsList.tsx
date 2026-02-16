import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Invitation } from '../../types/Invitation'
import {
  subscribeToUserInvitations,
  acceptInvitation,
  declineInvitation,
} from '../../services/invitations.service'
import { Button } from '../ui/button'

export default function InvitationsList() {
  const { currentUser, userProfile } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser || !userProfile) return

    const unsubscribe = subscribeToUserInvitations(userProfile.username, (newInvitations) => {
      setInvitations(newInvitations)
      setLoading(false)
    })

    return unsubscribe
  }, [currentUser, userProfile?.username])

  const handleAccept = async (invitation: Invitation) => {
    if (!currentUser || !userProfile) return

    setProcessingId(invitation.id)
    try {
      await acceptInvitation(
        invitation.id,
        currentUser.uid,
        userProfile.username,
        userProfile.displayName
      )
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert('Failed to accept invitation. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (invitationId: string) => {
    setProcessingId(invitationId)
    try {
      await declineInvitation(invitationId)
    } catch (error) {
      console.error('Error declining invitation:', error)
      alert('Failed to decline invitation. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
        <p className="text-gray-500 text-sm">Loading invitations...</p>
      </div>
    )
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Invitations ({invitations.length})
      </h3>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{invitation.spaceName}</p>
              <p className="text-sm text-gray-600">
                Invited by <span className="font-medium">@{invitation.invitedByUsername}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(invitation.createdAt.toDate()).toLocaleDateString()}
              </p>
            </div>

            <div className="flex space-x-2 ml-4">
              <Button
                onClick={() => handleAccept(invitation)}
                disabled={processingId === invitation.id}
                className="bg-gray-900 text-white hover:bg-gray-800"
                size="sm"
              >
                {processingId === invitation.id ? 'Accepting...' : 'Accept'}
              </Button>
              <Button
                onClick={() => handleDecline(invitation.id)}
                disabled={processingId === invitation.id}
                variant="outline"
                size="sm"
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
