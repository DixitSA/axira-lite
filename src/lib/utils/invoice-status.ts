export function computeInvoiceStatus(
  status: string,
  paidDate: Date | null,
  paidAmount: number,
  amount: number,
  dueDate: Date
): string {
  if (status === "VOID") return "VOID";
  if (status === "DRAFT") return "DRAFT";
  if (paidDate && paidAmount >= amount) return "PAID";
  if (new Date() > dueDate) return "OVERDUE";
  return "PENDING";
}
