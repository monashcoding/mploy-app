export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <div className="w-full">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[155px] w-full rounded-xl bg-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
