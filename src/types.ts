import {IconId} from "@openmrs/esm-framework";

export type DashboardLinkConfig = {
  path: string;
  title: string;
  icon?: IconId;
  moduleName?: string;
}
