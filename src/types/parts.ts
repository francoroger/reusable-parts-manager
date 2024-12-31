export type PartStatus = "ontime" | "warning" | "delayed";

export interface Part {
  id: string;
  name: string;
  description: string;
  serviceProvider: string;
  departureDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  estimatedDuration: number; // in days
  status: PartStatus;
  notes?: string;
}