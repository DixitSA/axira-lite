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
  OVERDUE: "Hi {firstName}, this is {businessName}. You have an outstanding balance of {amount} due on {dueDate}. Please let us know if you have any questions. Thanks!",
  CONFIRMATION: "Hi {firstName}, just confirming your {serviceType} appointment on {appointmentDate}. See you then! — {businessName}",
  FOLLOW_UP: "Hi {firstName}, it's been a while since your last {serviceType} with us. Ready to schedule another? Reply or call us anytime. — {businessName}",
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
