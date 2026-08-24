export interface Customer {

  idCustomer?: string;

  customerName: string;
  customerLastname: string;
  customerType: string;

  documentType: string;
  documentNumber: string;

  email: string;
  phone: string;
  address: string;
  ubigeoCode: string;

  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  restoredAt?: string;

  // campo legacy por si viene del backend con el objeto completo
  ubigeo?: {
    ubigeoCode: string;
    department?: string;
    province?: string;
    district?: string;
  };
}