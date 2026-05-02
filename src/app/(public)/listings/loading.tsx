export default function ApartmentsLoading() {
  return (
    <div className="container py-8">
      <div className="skeleton mb-4 h-8 w-48" />
      <div className="grid grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
