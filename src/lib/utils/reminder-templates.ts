import { formatCurrency, formatDate } from "./format";

export type TemplateData = {
  firstName: string;
  businessName: string;
  amount?: number;
  dueDate?: Date;
  serviceType?: string;
  appointmentDate?: Date;
};

export const REMINDER_TEMPLATES = {
  OVERDUE: "[Axira Lite] Hi {firstName}, your balance of {amount} was due on {dueDate}. Please let us know if you have questions. Reply STOP to opt out.",
  CONFIRMATION: "[Axira Lite] Hi {firstName}, confirming your {serviceType} appointment on {appointmentDate}. See you then! Reply STOP to opt out.",
  FOLLOW_UP: "[Axira Lite] Hi {firstName}, it's been a while since your last {serviceType}. Ready to schedule another? Reply or call us. Reply STOP to opt out.",
};

export function interpolateTemplate(template: string, data: TemplateData): string {
  let result = template
    .replace(/{firstName}/g, data.firstName || "there")
    .replace(/{businessName}/g, data.businessName || "Axira Lite");

  // Handle amount with fallback
  const amountStr = data.amount !== undefined ? formatCurrency(data.amount) : "$0.00";
  result = result.replace(/{amount}/g, amountStr);

  // Handle dates with fallback
  const dueDateStr = data.dueDate ? formatDate(data.dueDate) : "soon";
  result = result.replace(/{dueDate}/g, dueDateStr);

  const apptDateStr = data.appointmentDate ? formatDate(data.appointmentDate) : "your next visit";
  result = result.replace(/{appointmentDate}/g, apptDateStr);

  // Handle service type
  result = result.replace(/{serviceType}/g, data.serviceType || "service");

  return result;
}
