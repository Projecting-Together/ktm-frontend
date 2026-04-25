export default function NewsIndexLoading() {
  return (
    <main className="container py-10">
      <div className="skeleton mx-auto mb-8 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-48 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
