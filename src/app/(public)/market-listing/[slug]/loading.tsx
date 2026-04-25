export default function MarketListingDetailLoading() {
  return (
    <main className="container max-w-3xl py-10">
      <div className="skeleton mb-4 h-6 w-32" />
      <div className="skeleton mb-6 h-10 w-full" />
      <div className="space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 max-w-[90%]" />
      </div>
    </main>
  );
}
