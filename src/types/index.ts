export type UserRole = 'vendedora' | 'milton' | 'contador';

export interface User {
  uid: string;
  email: string;
  nombre: string;
  role: UserRole;
}

export interface Comprobante {
  id: string;
  vendedora_uid: string;
  vendedora_nombre: string;
  fecha_carga: number; // timestamp
  cliente_nombre: string;
  monto: number;
  fecha_pago: string; // YYYY-MM-DD
  numero_comprobante: string;
  archivo: {
    nombre: string;
    tipo: 'jpg' | 'png' | 'pdf';
    url: string;
    size_bytes: number;
  };
  categoria: 'FINANCIERA' | 'PROVEEDOR_A' | 'PROVEEDOR_B' | 'PROVEEDOR_C' | 'PROVEEDOR_D' | 'PROVEEDOR_E' | 'PROVEEDOR_F' | 'SIN_CATEGORIZAR';
  confirmado_por?: string;
  confirmado_en?: number;
  estado: 'pendiente' | 'confirmado' | 'duplicado' | 'rechazado';
  notas?: string;
  historial: {
    timestamp: number;
    usuario: string;
    accion: string;
    detalles: any;
  }[];
}

export interface Lote {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  comprobantes_ids: string[];
  estado: 'abierto' | 'cerrado';
  resumen: {
    total_comprobantes: number;
    total_monto: number;
    por_categoria: Record<string, { cantidad: number; monto: number }>;
  };
  reporte_final?: {
    url: string;
    generado_en: number;
    generado_por: string;
  };
}
