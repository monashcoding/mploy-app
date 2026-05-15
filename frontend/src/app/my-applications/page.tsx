import MyApplicationsClient from "@/components/applications/my-applications-client";
import { listApplications, listRecruitmentCycles } from "./actions";
import { STAGES } from "@/lib/stages";
import {
  DEFAULT_RECRUITMENT_CYCLE_ID,
  RecruitmentCycle,
} from "@/types/application";

export const dynamic = "force-dynamic";

export default async function MyApplicationsPage() {
  const [apps, cycles] = await Promise.all([
    listApplications().catch(() => []),
    listRecruitmentCycles().catch(
      () =>
        [
          {
            id: DEFAULT_RECRUITMENT_CYCLE_ID,
            name: "Current cycle",
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ] satisfies RecruitmentCycle[],
    ),
  ]);

  return (
    <div className="h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)] overflow-y-auto">
      <div className="max-w-7xl mx-auto py-6 px-6">
        <MyApplicationsClient
          initial={apps}
          initialStages={STAGES}
          initialCycles={cycles}
        />
      </div>
    </div>
  );
}
