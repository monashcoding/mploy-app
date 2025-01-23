import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";

const mockJobDetails = {
  title: "Job Title",
  company: "Company Name",
  type: "Graduate",
  locations: ["Location 1", "Location 2", "Location 3"],
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aeneantincidunt urna ac luctus pellentesque.",
  studyFields: ["Field 1", "Field 2", "Field 3"],
  posted: "01/01/2025",
  workingRights: ["Right 1", "Right 2", "Right 3"],
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
