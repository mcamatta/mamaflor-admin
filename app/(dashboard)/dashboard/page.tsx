import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { PeopleTablePreview } from "@/components/people-table-preview";
import { SectionCards } from "@/components/section-cards";

export default function DashboardPage() {
  return (
    <>
      <SectionCards />
      <div className="grid gap-4 px-4 lg:grid-cols-5 lg:px-6">
        <div className="lg:col-span-3">
          <ChartAreaInteractive />
        </div>
        <div className="lg:col-span-2">
          <PeopleTablePreview />
        </div>
      </div>
    </>
  );
}
