import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useComprobantes } from '../../hooks/useComprobantes';
import { Upload, X } from 'lucide-react';

export function UploadForm() {
  const { user } = useAuth();
  const { addComprobante, loading, error: uploadError } = useComprobantes();
  const navigate = useNavigate();
  
  const [cliente, setCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se aceptan JPG, PNG o PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no puede exceder 10MB');
        return;
      }
      
      setArchivo(file);
      setError('');

      // Crear preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview('📄 PDF cargado');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cliente || !monto || !fecha || !archivo) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!user) {
      setError('Debes estar autenticado');
      return;
    }

    try {
      await addComprobante(
        user.uid,
        user.nombre,
        cliente,
        parseFloat(monto),
        fecha,
        archivo
      );
      
      alert('Comprobante cargado exitosamente');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cargar Comprobante</h1>
          <p className="text-gray-600 mb-8">Completa los datos del comprobante de pago</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Empresa ABC"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto ($) *
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 5000"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprobante (JPG, PNG o PDF) *
              </label>
              
              {preview ? (
                <div className="relative bg-gray-100 rounded-lg p-4 mb-4">
                  {preview.includes('data:image') ? (
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                  ) : (
                    <div className="text-center py-8 text-gray-600">{preview}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setArchivo(null);
                      setPreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">Click para cargar o arrastra el archivo</p>
                  <p className="text-gray-500 text-sm">Máximo 10MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {(error || uploadError) && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {error || uploadError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              {loading ? 'Cargando...' : 'Cargar Comprobante'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
