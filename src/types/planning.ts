
export interface Application {
  id: number;
  address?: string;
  reference?: string;
  description?: string;
  status?: string;
  date?: string;
  received_date?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: [number, number];
  type?: string;
  classification?: string;
}
