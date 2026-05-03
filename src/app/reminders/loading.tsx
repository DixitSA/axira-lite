import PageHeader from "@/components/layout/page-header";

export default function RemindersLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <PageHeader 
        title="Reminders Log" 
        description="Loading logs..."
      />
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Table Skeleton */}
          <div className="p-4 space-y-4 mt-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
