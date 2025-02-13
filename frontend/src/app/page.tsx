"use client";

import { useFilterContext } from "@/context/filter/filter-context";
import { CreateQueryString } from "@/lib/utils";
import { JobFilters } from "@/types/filters";
import { Button, Title, Center, Group } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function Page() {
  const { updateFilters, filters } = useFilterContext();
  const router = useRouter();

  const handleGradJobsClick = () => {
    const newFilters = {
      ...filters.filters,
      jobTypes: new Set(["GRADUATE"]) as JobFilters["jobTypes"],
      page: 1,
    };

    updateFilters({ filters: newFilters });

    const queryParams = CreateQueryString({ filters: newFilters });
    router.push(`/jobs?${queryParams}`);
  };

  const handleInternJobsClick = () => {
    const newFilters = {
      ...filters.filters,
      jobTypes: new Set(["INTERN"]) as JobFilters["jobTypes"],
      page: 1,
    };

    updateFilters({ filters: newFilters });

    const queryParams = CreateQueryString({ filters: newFilters });
    router.push(`/jobs?${queryParams}`);
  };
  return (
    <Center className="h-full flex flex-col justify-start items-center flex-grow pt-60">
      <Title order={1} mb="xl" className="text-white">
        Discover your Dream Job.
      </Title>

      <Group gap="xl" align="center">
        <Button
          mt="xl"
          autoContrast
          size="lg"
          variant="filled"
          color="accent"
          radius="lg"
          onClick={handleGradJobsClick}
        >
          Search Grad Jobs →
        </Button>
        <Button
          mt="xl"
          autoContrast
          size="lg"
          variant="filled"
          color="accent"
          radius="lg"
          onClick={handleInternJobsClick}
        >
          Search Internships →
        </Button>
      </Group>
    </Center>
  );
}
