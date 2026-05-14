import MyApplicationsClient from "@/components/applications/my-applications-client";
import { listApplications } from "./actions";
import { STAGES } from "@/lib/stages";

export const dynamic = "force-dynamic";

export default async function MyApplicationsPage() {
  const apps = await listApplications().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto py-6 px-6">
      <MyApplicationsClient initial={apps} initialStages={STAGES} />
    </div>
  );
}
