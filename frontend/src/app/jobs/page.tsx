import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";
import { fetchJobs } from "@/app/api/fetchJobs";
import { JobFilters } from "@/types/filters";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<JobFilters>>;
}) {
  const params = await searchParams;
  await fetchJobs(params);

  const mockJobDetails = {
    id: "12345",
    title: "Frontend Developer",
    company: {
      name: "Reserve Bank of Australiaaaaa",
      website: "https://techcorp.com",
      logo: "https://connect-assets.prosple.com/cdn/ff/LxBzK0I5Jr8vU1WcXce4lf873yPS9Q67rLOugmUXsJI/1568086775/public/styles/scale_and_crop_center_120x120/public/2019-09/Logo-australian-security-intelligence-organisation-asio-120x120-2019.jpg?itok=T1OmQAn3https://connect-assets.prosple.com/cdn/ff/Ayx_liRamnduFSV1FsycoYaBNWIUiZfwkbuzQXDplKU/1568591959/public/styles/scale_and_crop_center_80x80/public/2019-09/Logo-australian-security-intelligence-organisation-asio-120x120-2019.jpg",
    },
    description:
      '<h2>Your role</h2>\r\n\r\n<p><strong>Key responsibilities are as follows:</strong></p>\r\n\r\n<ul>\r\n\t<li>Deploy and configure business systems to meet client needs.</li>\r\n\t<li>Perform systems process mapping and conduct needs analysis sessions with clients.</li>\r\n\t<li>Ensure seamless integration with existing infrastructure and processes.</li>\r\n\t<li>Customize system settings to optimize performance and functionality.</li>\r\n\t<li>Ensure compliance with industry standards and best practices.</li>\r\n\t<li>Conduct thorough testing and validation of system implementations.</li>\r\n</ul>\r\n\r\n<h2>About you</h2>\r\n\r\n<p><strong>The ideal candidate will have:</strong></p>\r\n\r\n<ul>\r\n\t<li>A recent third-level qualification in a tech-focused discipline.</li>\r\n\t<li>A base-level understanding of system architecture and design principles.</li>\r\n\t<li>Exposure to database management and data integration techniques is a bonus.</li>\r\n\t<li>A willingness to learn and enthusiasm for digital trends.</li>\r\n</ul>\r\n\r\n<h2>Compensation &amp; benefits</h2>\r\n\r\n<p>Enjoy a competitive salary, free weekly lunches, social events, flexible working options, and modern offices in the CBD.</p>\r\n\r\n<h2>Training &amp; development</h2>\r\n\r\n<p>Benefit from mentoring, coaching, and both internal and external training programs to enhance your career skills.</p>\r\n\r\n<h2>Career progression</h2>\r\n\r\n<p>Opportunities for career advancement as BlueRock Digital continues to grow, with the potential to take on more senior roles.</p>\r\n\r\n<p><a href="https://airtable.com/appIhfpXSddESkxG1/pagK6WyrT72pcRfvo/form?prefill_Title=Graduate%20Consultant%20-%20Digital%20Systems&amp;prefill_Original%20Source%20Link=https%3A%2F%2Fapply.workable.com%2Fthe-blue-rock%2Fj%2F983307A690%2F" rel="noopener" target="_blank">Report this job</a></p>',
    type: "Graduate",
    locations: ["VIC", "NSW", "TAS", "OTHERS", "QLD"],
    studyFields: ["IT & Computer Science", "Engineering & Mathematics"],
    workingRights: ["AUS_CITIZEN", "OTHER_RIGHTS"],
    applicationUrl: "https://careers.mcdonalds.com.au/",
    closeDate: "2025-01-15T00:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  return (
    <div className="space-y-4">
      <Title>Find Internships and Student Jobs</Title>
      <SearchBar />
      <FilterSection />

      <div className="mt-4 flex flex-col lg:flex-row gap-2 h-[calc(100vh-330px)] ">
        <div className="w-full lg:w-[35%] overflow-y-auto pr-2 no-scrollbar">
          <JobList />
        </div>

        {/* Sticky Job Details - hidden on mobile, 70% on desktop */}
        <div className="hidden lg:block lg:w-[65%]">
          <div className="overflow-y-auto h-[calc(100vh-330px)]">
            <JobDetails {...mockJobDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
