import Image from "next/image";
import Link from "next/link";

export default function JobNotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <Image src="/min-404.svg" alt="404 mascot" width={200} height={200} />
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="text-lg text-white/50">
        This job post is no longer taking applications or it does not exist.
      </p>
      <Link
        href="/jobs"
        className="rounded-lg bg-[#ffe22f] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-80"
      >
        Browse jobs
      </Link>
    </div>
  );
}
