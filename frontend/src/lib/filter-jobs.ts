import { Job } from "@/types/job";
import { JobFilters } from "@/types/filters";

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  return jobs.filter(job => {
    const searchMatch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company.name.toLowerCase().includes(filters.search.toLowerCase());
    
    const studyFieldMatch = filters.studyFields.length === 0 || 
      filters.studyFields.some(field => job.studyFields?.includes(field));
      
    const jobTypeMatch = filters.jobTypes.length === 0 ||
      filters.jobTypes.includes(job.type);
      
    const locationMatch = filters.locations.length === 0 ||
      filters.locations.some(location => job.locations.includes(location));

    return searchMatch && studyFieldMatch && jobTypeMatch && locationMatch;
  });
}
