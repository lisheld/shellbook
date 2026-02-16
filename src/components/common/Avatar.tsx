interface AvatarProps {
  displayName: string
  profilePhotoUrl?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ displayName, profilePhotoUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  }

  if (profilePhotoUrl) {
    return (
      <img
        src={profilePhotoUrl}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
  }

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-valentine-pink to-valentine-red rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {displayName[0]}
    </div>
  )
}
