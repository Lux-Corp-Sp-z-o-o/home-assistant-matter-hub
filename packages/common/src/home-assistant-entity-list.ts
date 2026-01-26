export interface HomeAssistantEntityListItem {
  entity_id: string;
  name: string;
  domain: string;
  platform?: string;
  area_id?: string;
  device_id?: string;
  device_name?: string;
  entity_category?: string;
  disabled_by?: string;
  hidden_by?: string;
}