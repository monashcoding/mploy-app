import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";

const mockJobDetails = {
  id:"12345",
  title:"Frontend Developer",
  company: {
    name: "Reserve Bank of Australiaaaaa",
    website: "https://techcorp.com",
    logo: "https://connect-assets.prosple.com/cdn/ff/LxBzK0I5Jr8vU1WcXce4lf873yPS9Q67rLOugmUXsJI/1568086775/public/styles/scale_and_crop_center_120x120/public/2019-09/Logo-australian-security-intelligence-organisation-asio-120x120-2019.jpg?itok=T1OmQAn3https://connect-assets.prosple.com/cdn/ff/Ayx_liRamnduFSV1FsycoYaBNWIUiZfwkbuzQXDplKU/1568591959/public/styles/scale_and_crop_center_80x80/public/2019-09/Logo-australian-security-intelligence-organisation-asio-120x120-2019.jpg",
  },
  description: "You will help perform data analytics to improve portfolio management and risk monitoring. You will help perform data analytics to improve portfolio management and risk monitoring.",
  type: "Graduate",
  locations: ["VIC", "NSW", "TAS", "OTHERS", "QLD"],
  studyFields: ["IT & Computer Science", "Engineering & Mathematics"],
  workingRights: ["AUS_CITIZEN", "OTHER_RIGHTS"],
  applicationUrl: "https://careers.mcdonalds.com.au/",
  closeDate: "2025-01-15T00:00:00Z",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
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
        <div className=" lg:block lg:w-[65%]">
          <div className="overflow-y-auto h-[calc(100vh-330px)]">
            <JobDetails {...mockJobDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
