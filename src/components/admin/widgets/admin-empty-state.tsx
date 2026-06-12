"use client"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  compact?: boolean
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-10" : "py-20"} space-y-4`}>
      <div
        className={`${compact ? "text-5xl" : "text-7xl"} select-none`}
        style={{ animation: "floatEmoji 3s ease-in-out infinite" }}
      >
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className={`${compact ? "text-base" : "text-lg"} font-black text-slate-800`}>{title}</h3>
        <p className={`${compact ? "text-xs" : "text-sm"} text-slate-500 max-w-xs mx-auto leading-relaxed`}>
          {description}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors"
        >
          {action.label}
        </button>
      )}

      <style jsx>{`
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
