// frontend/src/app/jobs/page.tsx
import FilterSection from "@/components/filters/filter-section";
import JobList from "@/components/jobs/job-list";
import JobDetails from "@/components/jobs/job-details";
import { JobFilters } from "@/types/filters";
import { getJobs, getSponsoredJobs } from "@/app/jobs/actions";
import NoResults from "@/components/ui/no-results";
import { Suspense } from "react";
import JobListLoading from "@/components/layout/job-list-loading";
import JobDetailsLoading from "@/components/layout/job-details-loading";
import { Job } from "@/types/job";

export const metadata = {
  title: "Jobs",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<JobFilters>>;
}) {
  // https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  // searchParams is a promise that resolves to an object containing the search
  // parameters of the current URL.

  const { jobs, total } = await getJobs(await searchParams);

  // Separate sponsored and regular jobs.
  const { jobs: sponsoredJobs } = await getSponsoredJobs(await searchParams);
  const platinumSponsors = ["IMC", "Atlassian"];

  // Group sponsored jobs by company.
  const sponsorsByCompany: {
    [companyName: string]: {
      jobs: Job[];
      companyLogo: string;
      website: string;
    };
  } = {};

  sponsoredJobs.forEach((job) => {
    const companyName = job.company.name;
    if (!sponsorsByCompany[companyName]) {
      sponsorsByCompany[companyName] = {
        jobs: [],
        companyLogo: job.company.logo ?? "",
        website: job.company.website ?? "",
      };
    }
    sponsorsByCompany[companyName].jobs.push(job);
  });

  // Convert grouped companies into an array with platinum flag
  const sponsorCompanies = Object.entries(sponsorsByCompany).map(
    ([companyName, data]) => ({
      companyName,
      isPlatinum: platinumSponsors.includes(companyName),
      jobs: data.jobs,
      companyLogo: data.companyLogo,
      website: data.website,
    }),
  );

  // Weighted random selection for sponsored slots.
  const pickRandomCompany = () => {
    const platinum = sponsorCompanies.filter((c) => c.isPlatinum);
    const nonPlatinum = sponsorCompanies.filter((c) => !c.isPlatinum);

    // 65% chance to choose platinum if available.
    const choosePlatinum = Math.random() < 0.65 && platinum.length > 0;
    const pool = choosePlatinum
      ? platinum
      : nonPlatinum.length > 0
        ? nonPlatinum
        : platinum;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const sponsoredSlots: Job[] = [];
  const usedJobIds = new Set<string>(); // Track individual job IDs
  const companyJobTracker = new Set<string>(); // Track individual job IDs
  const slots = 4;
  for (let i = 0; i < slots; i++) {
    let company = pickRandomCompany();
    let attempts = 0;
    let randomJob: Job | undefined;
    while (attempts < 20) {
      if (!company) break;
      // Pick a random job from this company
      const candidate =
        company.jobs[Math.floor(Math.random() * company.jobs.length)];
      if (!usedJobIds.has(candidate.id)) {
        randomJob = candidate;
        break;
      }
      attempts++;
      // Optionally, try a different company if the candidate is already used
      companyJobTracker.add(company.companyName);
      company = pickRandomCompany();
    }
    if (company && randomJob && !usedJobIds.has(randomJob.id)) {
      usedJobIds.add(randomJob.id);
      sponsoredSlots.push(randomJob);
    }
  }

  const sponsoredJobIds = new Set(sponsoredSlots.map((job) => job.id));
  const jobsWithoutDuplicates = jobs.filter(
    (job) => !sponsoredJobIds.has(job.id),
  );

  return (
    <>
      <FilterSection _totalJobs={total} />

      {total <= 0 ? (
        <NoResults />
      ) : (
        <div className="mt-4 flex flex-col lg:flex-row">
          <div id="job-list-container" className="lg:pr-1 w-full lg:w-[35%]">
            <Suspense fallback={<JobListLoading />}>
              <JobList
                jobs={jobsWithoutDuplicates}
                sponsoredJobs={sponsoredSlots}
              />
            </Suspense>
          </div>

          <div className="hidden lg:block lg:w-[65%] overflow-y-auto h-[calc(100svh-140px)] lg:h-[calc(100svh-180px)]">
            <Suspense fallback={<JobDetailsLoading />}>
              <JobDetails />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
