// frontend/src/lib/transform-job-data.ts
interface MongoDBJob {
  _id: { $oid: string };
  title: string;
  description: string;
  company: {
    name: string;
    website: string;
    logo?: string;
  };
  application_url: string;
  wfh_status: string | null;
  type: string;
  close_date: { $date: string };
  locations: string[];
  study_fields: string[];
  working_rights: string[];
  created_at: { $date: string };
  updated_at: { $date: string };
}

export function transformJobData(mongoJob: MongoDBJob) {
  return {
    id: mongoJob._id.$oid,
    title: mongoJob.title,
    company: {
      name: mongoJob.company.name,
      website: mongoJob.company.website,
    },
    description: mongoJob.description,
    type: mongoJob.type,
    locations: mongoJob.locations,
    studyFields: mongoJob.study_fields,
    workingRights: mongoJob.working_rights,
    applicationUrl: mongoJob.application_url,
    closeDate: new Date(mongoJob.close_date.$date).toISOString(),
    startDate: new Date(mongoJob.created_at.$date).toISOString(),
    createdAt: new Date(mongoJob.created_at.$date).toISOString(),
    updatedAt: new Date(mongoJob.updated_at.$date).toISOString(),
  };
}
