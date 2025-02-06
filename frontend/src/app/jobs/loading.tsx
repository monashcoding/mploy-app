import ThreeDotLoader from "@/components/ui/loading_dots";

// frontend/src/app/jobs/loading.tsx
export default function JobLoading() {
  return (
    <div className="flex min-h-[70vh] justify-center items-center ">
      <ThreeDotLoader />
    </div>
  );
}
