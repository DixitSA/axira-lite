interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="px-6 py-6 border-b border-gray-100 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">{title}</h1>
          {description && (
            <div className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-2">
              {description}
            </div>
          )}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}
