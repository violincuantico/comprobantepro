import { useState, useCallback } from 'react';
import { Comprobante } from '../types';
import { db, uploadFile } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export function useComprobantes() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComprobante = useCallback(async (
    vendedora_uid: string,
    vendedora_nombre: string,
    cliente_nombre: string,
    monto: number,
    fecha_pago: string,
    archivo: File
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Subir archivo
      const path = `comprobantes/${new Date().getTime()}_${archivo.name}`;
      const archivo_url = await uploadFile(archivo, path);

      // Crear documento en Firestore
      const comprobanteData: Omit<Comprobante, 'id'> = {
        vendedora_uid,
        vendedora_nombre,
        fecha_carga: new Date().getTime(),
        cliente_nombre,
        monto,
        fecha_pago,
        numero_comprobante: '',
        archivo: {
          nombre: archivo.name,
          tipo: archivo.type as any,
          url: archivo_url,
          size_bytes: archivo.size
        },
        categoria: 'SIN_CATEGORIZAR',
        estado: 'pendiente',
        historial: [{
          timestamp: new Date().getTime(),
          usuario: vendedora_uid,
          accion: 'cargado',
          detalles: { cliente: cliente_nombre, monto }
        }]
      };

      const docRef = await addDoc(collection(db, 'comprobantes'), comprobanteData);
      
      return {
        id: docRef.id,
        ...comprobanteData
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar comprobante';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateComprobante = useCallback(async (
    id: string,
    updates: Partial<Comprobante>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'comprobantes', id);
      await updateDoc(docRef, updates);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComprobantes = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'comprobantes'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comprobante[];
      setComprobantes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToComprobantes = useCallback(() => {
    const q = query(collection(db, 'comprobantes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comprobante[];
      setComprobantes(data);
    });
    return unsubscribe;
  }, []);

  return {
    comprobantes,
    loading,
    error,
    addComprobante,
    updateComprobante,
    fetchComprobantes,
    subscribeToComprobantes
  };
}
