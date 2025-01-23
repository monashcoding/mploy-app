import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";

const mockJobDetails = {
  title: "REALLLY LONG TITLE ATHAT YOU SHOULD BE ETXENDING TO SHOW WHAT TO DO IN CASE OF LONGNGGGG NAMES UH OH",
  company: "Company Name",
  jobType: "Graduate",
  locations: ["Location 1", "Location 2", "Location 3", "Location 4", "Location 5", "Location 6", "Location 7"],
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aeneantincidunt urna ac luctus pellentesque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aeneantincidunt urna ac luctus pellentesque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aeneantincidunt urna ac luctus pellentesque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aeneantincidunt urna ac luctus pellentesque.",
  studyFields: ["Field 1", "Field 2", "Field 3"],
  posted: "01/01/2025",
  workingRights: ["Right 1", "Right 2", "Right 3"],
  applicationURL: "https://careers.mcdonalds.com.au/"
};

export default function JobsPage() {
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
