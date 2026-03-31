import MyApplicationsClient from "@/components/applications/my-applications-client";
import { listApplications } from "./actions";

export default async function MyApplicationsPage() {
  const apps = await listApplications().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto pt-6">
      <MyApplicationsClient initial={apps} />
    </div>
  );
}

