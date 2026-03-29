import type {DashboardLinkConfig} from "./types";

export const dashboardMeta: DashboardLinkConfig & { slot: string } = {
  slot: 'patient-chart-procedures-dashboard-slot',
  path: 'Procedures',
  title: 'Procedures',
  icon: 'omrs-icon-procedure-order',
};
