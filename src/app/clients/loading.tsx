import PageHeader from "@/components/layout/page-header";

export default function ClientsLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <PageHeader 
        title="Clients" 
        description="Loading clients..."
      >
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
      </PageHeader>
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Filters Skeleton */}
          <div className="p-4 border-b border-gray-200">
            <div className="h-9 w-full max-w-md bg-gray-200 rounded-md"></div>
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
