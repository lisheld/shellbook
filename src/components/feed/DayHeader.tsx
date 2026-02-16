interface DayHeaderProps {
  date: string
}

export default function DayHeader({ date }: DayHeaderProps) {
  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-valentine-light-pink to-pink-100 py-3 px-4 mb-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-valentine-red text-center">
        {date}
      </h2>
    </div>
  )
}
