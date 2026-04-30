import { db } from "@/lib/db";
import PageHeader from "@/components/layout/page-header";
import { formatRelativeDate, formatDate } from "@/lib/utils/format";
import StatusBadge from "@/components/ui/status-badge";
import { 
  DataTable, 
  DataTableHeader, 
  DataTableBody, 
  DataTableRow, 
  DataTableCell 
} from "@/components/ui/data-table";

export default async function RemindersPage() {
  const reminders = await db.reminderMessage.findMany({
    include: { client: true },
    orderBy: { sentAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Reminders Log" 
        description={`${reminders.length} messages sent`}
      />
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <DataTable>
            <DataTableHeader>
              <DataTableCell isHeader className="w-[20%]">Client</DataTableCell>
              <DataTableCell isHeader className="w-[50%]">Message</DataTableCell>
              <DataTableCell isHeader className="w-[15%] text-center">Status</DataTableCell>
              <DataTableCell isHeader className="w-[15%]">Sent At</DataTableCell>
            </DataTableHeader>
            <DataTableBody>
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    No reminders sent yet.
                  </td>
                </tr>
              ) : (
                reminders.map((reminder) => (
                  <DataTableRow key={reminder.id}>
                    <DataTableCell className="font-medium text-gray-900">
                      {reminder.client.firstName} {reminder.client.lastName}
                    </DataTableCell>
                    <DataTableCell className="text-gray-500 max-w-md truncate">
                      {reminder.content}
                    </DataTableCell>
                    <DataTableCell className="text-center">
                      <StatusBadge status={reminder.status} />
                    </DataTableCell>
                    <DataTableCell className="text-gray-500">
                      <div className="flex flex-col">
                        <span>{formatRelativeDate(reminder.sentAt)}</span>
                        <span className="text-xs">{formatDate(reminder.sentAt)}</span>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </div>
      </div>
    </div>
  );
}
