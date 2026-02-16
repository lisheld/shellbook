import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosts } from '../../hooks/usePosts'
import { useSpace } from '../../context/SpaceContext'
import { groupByDate } from '../../utils/dateHelpers'
import PhotoCard from './PhotoCard'
import DayHeader from './DayHeader'
import UploadButton from './UploadButton'
import UploadModal from '../upload/UploadModal'
import InvitationsList from '../spaces/InvitationsList'
import { Button } from '../ui/button'

export default function PhotoFeed() {
  const navigate = useNavigate()
  const { currentSpace, loading: spaceLoading } = useSpace()
  const { posts, loading, error } = usePosts(currentSpace?.id || null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  if (spaceLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentSpace) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No space selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please create or select a space to get started.
          </p>
          <Button onClick={() => navigate('/create-first-space')} className="w-full">
            Create Your First Space
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const groupedPosts = groupByDate(posts)

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Invitations Section */}
        <div className="mb-8">
          <InvitationsList />
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No photos yet
              </h2>
              <p className="text-gray-600 mb-6">
                Upload your first picture to get started
              </p>
              <Button onClick={() => setShowUploadModal(true)} className="w-full">
                Upload Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(groupedPosts.entries()).map(([date, datePosts]) => (
              <div key={date}>
                <DayHeader date={date} />
                <div className="space-y-6">
                  {datePosts.map((post) => (
                    <PhotoCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadButton onClick={() => setShowUploadModal(true)} />

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </>
  )
}
