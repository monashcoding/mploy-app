"use client";

import { useFilterContext } from "@/context/filter/filter-context";
import { CreateQueryString } from "@/lib/utils";
import { JobFilters } from "@/types/filters";
import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import DotBackground from "@/components/ui/dot-background";

export default function Page() {
  const { updateFilters, filters } = useFilterContext();
  const router = useRouter();

  useEffect(() => {
    document.title = "Home | MAC Jobs Board";
  }, []);

  const handleGradJobsClick = () => {
    const newFilters = {
      ...filters.filters,
      jobTypes: ["GRADUATE"] as JobFilters["jobTypes"],
      page: 1,
    };

    updateFilters({ filters: newFilters });

    const queryParams = CreateQueryString({ filters: newFilters });
    router.push(`/jobs?${queryParams}`);
  };

  const handleInternJobsClick = () => {
    const newFilters = {
      ...filters.filters,
      jobTypes: ["INTERN"] as JobFilters["jobTypes"],
      page: 1,
    };

    updateFilters({ filters: newFilters });

    const queryParams = CreateQueryString({ filters: newFilters });
    router.push(`/jobs?${queryParams}`);
  };
  return (
    <>
      <DotBackground />

      <div className="flex flex-col items-center mt-16 md:mt-0 md:justify-center min-h-[80vh] text-center px-4">
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
