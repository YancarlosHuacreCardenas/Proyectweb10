import { Ubigeo } from './ubigeo.interface';
import { Role } from './role.interface';

export interface Employee {
  employeeId?: number;
  ubigeo?: Ubigeo;
  role?: Role;
  documentType?: string;
  documentNumber?: string;
  name: string;
  lastName: string;
  phone?: string;
  email: string;
  address?: string;
  entryDate?: string;
  status?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  restoredAt?: string | null;
}
