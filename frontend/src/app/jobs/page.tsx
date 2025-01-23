import SearchBar from "@/components/jobs/search/search-bar";
import FilterSection from "@/components/jobs/filters/filter-section";
import JobList from "@/components/jobs/details/job-list";
import JobDetails from "@/components/jobs/details/job-details";
import { Title } from "@mantine/core";

const mockJobDetails = {
  id:"12345",
  title:"Frontend Developer",
  company: {
    name: "Tech Corp",
    website: "https://techcorp.com",
    logo: "https://media.cdn.gradconnection.com/uploads/0e22d09c-e7f7-4806-a39d-202bd6e004a0-new-logo.png",
  },
  description: "<p>Have you recently graduated from University, looking for an inclusive and diverse work environment, want to make a real difference, be valued, and take on endless opportunities for growth whilst being your authentic self?</p>\r\n\r\n<p>If you answered yes to any of the above, the NIAA Graduate Program wants you to apply!&nbsp;</p>\r\n\r\n<p>Our Operations and Delivery Stream is aligned to graduates who are interested in working in our regions to work on implementing and delivering range of government initiatives and commitments.</p>\r\n\r\n<p>Our Agency is unique: we are about people,&nbsp;purpose and partnerships. We are committed to a common goal, we care about each other and our stakeholders, and we work with in partnership to support the self-determination and aspirations of First Nations peoples.&nbsp;</p>\r\n\r\n<p><strong>What NIAA provides</strong></p>\r\n\r\n<ul>\r\n\t<li>12 month program consisting of three rotations through various work areas with a potential rotation in one of our metropolitan, regional or remote locations.</li>\r\n\t<li>Commencing as an APS4, salary of $77,558 p.a. + 15.4% superannuation with eligible advancement to the APS 5 level and have the opportunity to be assessed to advance to the APS 6 level.</li>\r\n\t<li>Various locations on offer Brisbane, Canberra, Darwin and Perth</li>\r\n\t<li>Choose from one of our tailored streams Policy and Program, Corporate and Enabling and Operations and Delivery</li>\r\n\t<li>Extensive professional learning and development opportunities to support your career progression and possible future promotions</li>\r\n\t<li>Experience our award winning cross-cultural learning ‘Footprints Program’</li>\r\n\t<li>An inclusive and diverse workplace including of our 6 employee networks\r\n\t<ul>\r\n\t\t<li>Aboriginal and Torres Strait Islander Network</li>\r\n\t\t<li>Culturally and Linguistically Diverse Network</li>\r\n\t\t<li>Disability Network</li>\r\n\t\t<li>Pride Network</li>\r\n\t\t<li>Wellbeing Network</li>\r\n\t\t<li>Women’s Network</li>\r\n\t</ul>\r\n\t</li>\r\n\t<li>People are the heart of the NIAA, Graduates are no different we provide tailored dedicated support through, buddies, mentors, pastoral care as well as networking opportunities.</li>\r\n</ul>\r\n\r\n<p><strong>The work you will do</strong></p>\r\n\r\n<p>As an NIAA graduate, you will develop the skills, capabilities and networks to progress in your APS careers while contributing to implementing the Government’s priorities to provide the greatest benefit to all First Nations people.&nbsp;</p>\r\n\r\n<p>It’s an incredibly exciting time to be joining the NIAA as we work in partnership to enable the self- determination and aspirations of First Nations people and communities. The Agency is unique, providing endless opportunities and great diversity in our roles, from policy, programs, engagement, grants administration and corporate, and much more.&nbsp;</p>\r\n\r\n<p>The Operations and Delivery Stream offers challenging, interesting and stimulating work, engaging across all levels of government and working directly with the community and other invested stakeholders. The Operations and Delivery stream works to engage with First Nations communities, leadership and service providers to deliver outcomes in line with community aspirations on behalf of the Australian Government.</p>\r\n\r\n<p><strong>Rotation opportunities in:</strong></p>\r\n\r\n<p>•community engagement and consultation, regional strategy and policy including local and place-based initiatives, data and evaluation, grant design, administration and reporting of the Indigenous Advancement Strategy.</p>\r\n\r\n<p><strong>You could be assisting with the following key pieces of work:</strong></p>\r\n\r\n<ul>\r\n\t<li>Providing advice to the Minister and Assistant Minister for Indigenous Australians, as well as the Special Envoy for Reconciliation&nbsp;[GK1]&nbsp; and&nbsp;the Implementation of&nbsp;the Uluru Statement&nbsp;from&nbsp;the Heart</li>\r\n\t<li>Implementation of the Uluru Statement from the Heart – Voice, Treaty and Truth.</li>\r\n\t<li>Working closely with Aboriginal and Torres Strait Islander communities, state and territory governments and Indigenous organisations</li>\r\n\t<li>Implementation of the National Agreement on Closing the Gap</li>\r\n\t<li>Developing policies and delivering programs with and for First Nations Peoples</li>\r\n\t<li>Working with and advising other government agencies on Indigenous affairs matters</li>\r\n\t<li>Championing reconciliation throughout Australia.</li>\r\n</ul>\r\n\r\n<p><strong>Who we’re looking for?&nbsp;</strong></p>\r\n\r\n<p>The NIAA has an ambitious reform agenda ahead of us, we&nbsp;seeking candidates that want to work at the NIAA because they are passionate and want to make a real difference by contributing to work that ensures Aboriginal and Torres Strait Islander peoples are heard, recognised and empowered.</p>\r\n\r\n<p>We are looking for a<strong>&nbsp;</strong>variety of academic disciplines with diverse experiences and backgrounds.&nbsp; Our graduate roles are fast-paced, dynamic and present an exciting opportunity for someone with curiosity and a willingness to learn.&nbsp;</p>\r\n\r\n<p>So if you are someone that wants to leave your mark on the public service and be able to point to an accomplishment that has lasting impacts for the Australian people, NIAA is the place for you.</p>\r\n\r\n<p><strong>Did you know?</strong></p>\r\n\r\n<p>The 2026 NIAA Graduate program has both an affirmative measures disability and affirmative measures Indigenous recruitment process. What does this mean? Affirmative measures are vacancies designed to address the under-representation of people who identify as having disability or as Aboriginal and/or Torres Strait Islander in the Australian Public Service (APS).</p>\r\n\r\n<p><strong>Who can apply</strong></p>\r\n\r\n<p>To be eligible to apply, you must have completed your university degree within the last eight years or be in your final year of study with at least a credit average. &nbsp;</p>\r\n\r\n<p>You also must be an Australian citizen and willing to undergo police pre-screening checks as required. Be able to obtain and maintain an Australian Government security clearance to a minimum of Baseline level.</p>\r\n\r\n<p><strong>Timeline</strong></p>\r\n\r\n<ul>\r\n\t<li>4 March - 22 April - Submission of a simple online application, including a 300-word pitch, resume with referees and academic transcript.</li>\r\n\t<li>May - Online video interview</li>\r\n\t<li>July - Virtual Assessment Centre including a speed interview, written activity and group activity.</li>\r\n\t<li>Referee checks</li>\r\n\t<li>September – Offers</li>\r\n\t<li>February 2026 - Successful candidates commence the program.</li>\r\n</ul>\r\n\r\n<p><strong>How to apply</strong></p>\r\n\r\n<p>We have a real purpose with endless opportunities.&nbsp;</p>\r\n\r\n<p>Leave your mark on the public service and apply today for the NIAA Graduate Program.</p>\r\n\r\n<p>To find out more please visit our&nbsp;website.</p>",
  type: "Graduate",
  locations: ["VIC", "NSW"],
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
        <div className="hidden lg:block lg:w-[65%]">
          <div className="overflow-y-auto h-[calc(100vh-330px)]">
            <JobDetails {...mockJobDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
