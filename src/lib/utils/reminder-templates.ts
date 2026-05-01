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
    .replace(/{firstName}/g, data.firstName || "")
    .replace(/{businessName}/g, data.businessName || "Axira Lite");

  if (data.amount !== undefined) {
    result = result.replace(/{amount}/g, formatCurrency(data.amount));
  }
  if (data.dueDate) {
    result = result.replace(/{dueDate}/g, formatDate(data.dueDate));
  }
  if (data.serviceType) {
    result = result.replace(/{serviceType}/g, data.serviceType);
  }
  if (data.appointmentDate) {
    result = result.replace(/{appointmentDate}/g, formatDate(data.appointmentDate));
  }

  return result;
}
