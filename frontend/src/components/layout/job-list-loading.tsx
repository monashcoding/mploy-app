export default function JobListLoading() {
  return (
    <div className="space-y-4">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="h-[10.5rem] animate-pulse bg-secondary rounded-xl"
        />
      ))}
    </div>
  );
}
