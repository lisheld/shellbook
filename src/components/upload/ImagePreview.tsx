interface ImagePreviewProps {
  file: File
  previewUrl: string
  onRemove: () => void
}

export default function ImagePreview({ file, previewUrl, onRemove }: ImagePreviewProps) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="relative">
      <img
        src={previewUrl}
        alt="Preview"
        className="w-full h-auto rounded-lg"
      />
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={onRemove}
          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {file.name} ({fileSizeMB} MB)
      </p>
    </div>
  )
}
