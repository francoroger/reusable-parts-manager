export type PartStatus = "ontime" | "warning" | "delayed";

export interface ServiceProvider {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Part {
  id: string;
  serviceOrderNumber: string;
  clientName: string;
  description: string;
  serviceProvider: string;
  serviceProviderId?: string;
  departureDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  estimatedDuration: number;
  status: PartStatus;
  notes?: string;
  archived?: boolean;
  created_at?: Date;
  updated_at?: Date;
}