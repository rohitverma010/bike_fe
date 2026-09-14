export default function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton-img"></div>
          <div className="card-body">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ApiError({ what }: { what: string }) {
  return (
    <div className="api-error">
      <strong>Couldn't load {what}</strong>
      Make sure the backend server is running at localhost:8010, then refresh.
    </div>
  );
}
