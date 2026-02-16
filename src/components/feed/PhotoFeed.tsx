import { useState } from 'react'
import { usePosts } from '../../hooks/usePosts'
import { groupByDate } from '../../utils/dateHelpers'
import PhotoCard from './PhotoCard'
import DayHeader from './DayHeader'
import UploadButton from './UploadButton'
import UploadModal from '../upload/UploadModal'

export default function PhotoFeed() {
  const { posts, loading, error } = usePosts()
  const [showUploadModal, setShowUploadModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💕</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-valentine-red hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const groupedPosts = groupByDate(posts)

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">💕</p>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No photos yet!
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your first picture to get started!
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-valentine-pink to-valentine-red text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Upload Photo
            </button>
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
