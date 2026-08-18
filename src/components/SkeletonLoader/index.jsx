import './skeleton.scss'

const SkeletonLoader = ({ rows = 5, columns = 3 }) => (
  <div className="skeleton-wrapper" aria-busy="true" aria-label="Đang tải dữ liệu...">
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="skeleton-row">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div key={colIdx} className="skeleton-cell shimmer" />
        ))}
      </div>
    ))}
  </div>
)

export default SkeletonLoader
