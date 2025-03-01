"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import DotBackground from "@/components/ui/dot-background";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Home | MAC Jobs Board";
  }, []);

  const handleGradJobsClick = () => {
    router.push(`/jobs?jobTypes%5B%5D=GRADUATE&page=1&sortBy=recent`);
  };

  const handleInternJobsClick = () => {
    router.push(`/jobs?jobTypes%5B%5D=INTERN&page=1&sortBy=recent`);
  };

  return (
    <>
      <DotBackground />

      <div className="flex flex-col items-center mt-20 md:mt-0 md:justify-center min-h-[80vh] text-center px-4">
        <div className="flex items-center gap-2 mb-4 md:mb-8">
          <Link
            href="https://github.com/monashcoding/mploy-app"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-1 bg-secondary rounded-full text-sm hover:bg-selected transition-colors"
          >
            Proudly Open Source →
          </Link>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl">
          Stay ahead with the job board that{" "}
          <span className={"underline-fancy font-extrabold"}>never</span>{" "}
          sleeps.
        </h1>

        <p className="text-sm md:text-lg text-gray-400 max-w-2xl mb-8">
          Stop wasting hours manually tracking job sites. Our smart robots work
          24/7 to find you the most up to date listings so you can focus on what
          really matters.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="sm"
            color="accent"
            c="black"
            rightSection={<IconArrowRight size={20} />}
            onClick={handleInternJobsClick}
          >
            Internships
          </Button>

          <Button
            size="sm"
            color="secondary"
            c="white"
            rightSection={<IconArrowRight size={20} />}
            className={"font-light"}
            onClick={handleGradJobsClick}
          >
            Graduate Jobs
          </Button>
        </div>
      </div>
    </>
  );
}
