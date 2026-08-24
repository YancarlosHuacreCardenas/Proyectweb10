export interface Supplier {
  supplierId?: number;
  companyName: string;
  ruc: string;
  phone: number | string;
  email: string;
  address: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  restoredAt?: string;

  ubigeo: {
    ubigeoCode: number;
    department?: string;
    province?: string;
    district?: string;
  };

  category: {
    categoryId: number;
    categoryName?: string;
  };
}

// Helper: mapa de categorías (para cuando no venga el nombre del backend)
export const CATEGORY_MAP: { [key: number]: string } = {
  1: 'Semillas',
  2: 'Fertilizantes',
  3: 'Herramientas',
  4: 'Insecticidas',
  5: 'Sustratos',
  6: 'Envases'
};