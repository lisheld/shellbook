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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Invitations Section */}
          <div className="mb-8">
            <InvitationsList />
          </div>

          {/* Welcome Message */}
          <div className="text-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to shellbook
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a space to organize and share photos with different groups of people, or accept an invitation to join an existing space.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/create-first-space')} className="bg-gray-900 hover:bg-gray-800 text-white">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create a Space
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Spaces help you organize photos by groups like Family, Friends, or Work
            </p>
          </div>
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
