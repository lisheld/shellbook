interface DayHeaderProps {
  date: string
}

export default function DayHeader({ date }: DayHeaderProps) {
  return (
    <div className="sticky top-16 z-40 bg-gray-100 py-3 px-4 mb-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        {date}
      </h2>
    </div>
  )
}
