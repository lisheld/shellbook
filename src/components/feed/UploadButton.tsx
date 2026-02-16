interface UploadButtonProps {
  onClick: () => void
}

export default function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-50 border-2 border-gray-900"
      aria-label="Upload photo"
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  )
}
