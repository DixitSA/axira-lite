import PageHeader from "@/components/layout/page-header";

export default function JobsLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <PageHeader 
        title="Jobs" 
        description="Loading jobs..."
      >
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
      </PageHeader>
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Filters Skeleton */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="h-9 w-full sm:w-64 bg-gray-200 rounded-md"></div>
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded-md"></div>
          </div>
          
          {/* Table Skeleton */}
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
