export default function PublicSegmentLoading() {
  return (
    <div className="container py-10">
      <div className="skeleton mx-auto mb-6 h-10 max-w-lg" />
      <div className="skeleton mx-auto mb-10 h-5 max-w-xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    </div>
  );
}
