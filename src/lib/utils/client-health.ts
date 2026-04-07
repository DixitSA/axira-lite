import { HEALTH_THRESHOLDS } from "./constants";

export function computeClientHealth(lastJobAt: Date | null): string {
  if (!lastJobAt) return "INACTIVE";

  const now = new Date();
  const diffMs = now.getTime() - lastJobAt.getTime();
  const daysSinceLastJob = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysSinceLastJob < HEALTH_THRESHOLDS.ACTIVE) return "ACTIVE";
  if (daysSinceLastJob < HEALTH_THRESHOLDS.WATCH) return "WATCH";
  if (daysSinceLastJob < HEALTH_THRESHOLDS.AT_RISK) return "AT_RISK";
  return "INACTIVE";
}
