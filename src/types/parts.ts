export type PartStatus = "ontime" | "warning" | "delayed";

export interface ServiceProvider {
  id: string;
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Part {
  id: string;
  service_order_number: string;
  client_name: string;
  description?: string | null;
  service_provider_id?: string | null;
  service_provider?: string;
  departure_date: string;
  expected_return_date: string;
  actual_return_date?: string | null;
  estimated_duration: number;
  status: PartStatus;
  notes?: string | null;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  images?: string[];
}