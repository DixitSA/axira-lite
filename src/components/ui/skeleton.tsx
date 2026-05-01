/**
 * Hard-edged skeleton loaders for the "Precision Cockpit" aesthetic.
 * No pulse animations, just clean structural blocks that hold layout.
 */

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="skeleton-line h-3"
            style={{ width: `${60 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className="skeleton-line h-3"
              style={{ width: `${40 + Math.random() * 60}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  lines?: number;
}

export function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
      <div className="skeleton-line h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line h-3"
          style={{ width: `${50 + Math.random() * 50}%` }}
        />
      ))}
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-2">
      <div className="skeleton-line h-3 w-2/3" />
      <div className="skeleton-line h-6 w-1/2" />
    </div>
  );
}
