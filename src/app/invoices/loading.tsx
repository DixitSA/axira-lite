import PageHeader from "@/components/layout/page-header";

export default function InvoicesLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <PageHeader 
        title="Invoices" 
        description="Loading invoices..."
      >
        <div className="flex items-center gap-4">
          <div className="text-right mr-4 hidden sm:block">
            <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </PageHeader>
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Filters Skeleton */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="h-9 w-full sm:flex-1 bg-gray-200 rounded-md"></div>
            <div className="h-9 w-32 bg-gray-200 rounded-md"></div>
          </div>
          
          {/* Table Skeleton */}
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/5 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/5 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/5 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/5 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
