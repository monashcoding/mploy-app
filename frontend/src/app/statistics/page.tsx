import ApplicationsStatisticsClient from "@/components/statistics/applications-statistics-client";
import {
  listApplications,
  listApplicationStatusEvents,
  listRecruitmentCycles,
} from "@/app/my-applications/actions";
import {
  DEFAULT_RECRUITMENT_CYCLE_ID,
  RecruitmentCycle,
} from "@/types/application";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
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
  const events = await listApplicationStatusEvents(
    apps.map((app) => app.jobId),
  ).catch(() => []);

  return (
    <div className="stats-page-shell h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)] overflow-y-auto">
      <div className="stats-page-inner max-w-7xl mx-auto py-6 px-6">
        <ApplicationsStatisticsClient
          initialApps={apps}
          initialEvents={events}
          initialCycles={cycles}
        />
      </div>
    </div>
  );
}
