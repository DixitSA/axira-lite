import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import WeeklyCalendar from "@/components/calendar/weekly-calendar";

export default async function CalendarPage() {
  const { businessId } = await getAuthenticatedUser();

  // Fetch jobs for the next 90 days to cover typical calendar navigation
  const now = new Date();
  const pastBuffer = new Date(now);
  pastBuffer.setDate(now.getDate() - 30);
  
  const futureBuffer = new Date(now);
  futureBuffer.setDate(now.getDate() + 90);

  const jobs = await db.job.findMany({
    where: { 
      businessId,
      scheduledStart: {
        gte: pastBuffer,
        lte: futureBuffer
      }
    },
    include: { client: true }
  });

  const formattedJobs = jobs.map(j => ({
    id: j.id,
    title: j.title,
    clientName: `${j.client.firstName} ${j.client.lastName}`,
    scheduledStart: j.scheduledStart,
    status: j.status
  }));

  return (
    <div className="flex flex-col min-h-screen h-full">
      <PageHeader 
        title="Operations Calendar" 
        description="Schedule and dispatch overview" 
      />
      <div className="p-6 flex-1 max-w-[1600px] mx-auto w-full">
        <WeeklyCalendar jobs={formattedJobs} />
      </div>
    </div>
  );
}
