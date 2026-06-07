import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useComprobantes } from '../../hooks/useComprobantes';
import { Comprobante } from '../../types';
import { LogOut, Plus, FileText } from 'lucide-react';
import { logoutUser } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const { comprobantes, subscribeToComprobantes } = useComprobantes();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToComprobantes();
    return unsubscribe;
  }, [subscribeToComprobantes]);

  const comprobantesFiltraos = filtroCategoria === 'TODAS' 
    ? comprobantes 
    : comprobantes.filter(c => c.categoria === filtroCategoria);

  const estadisticas = {
    total: comprobantes.length,
    pendientes: comprobantes.filter(c => c.estado === 'pendiente').length,
    confirmados: comprobantes.filter(c => c.estado === 'confirmado').length,
    monto_total: comprobantes.reduce((sum, c) => sum + c.monto, 0)
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ComprobantePro</h1>
            <p className="text-gray-600 text-sm mt-1">Bienvenido, {user?.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Comprobantes Nuevos</p>
            <p className="text-3xl font-bold text-blue-600">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Confirmados</p>
            <p className="text-3xl font-bold text-green-600">{estadisticas.confirmados}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total de Comprobantes</p>
            <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Monto Total</p>
            <p className="text-3xl font-bold text-purple-600">${estadisticas.monto_total.toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Cargar Comprobante
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Categoría
          </label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODAS">Todas las categorías</option>
            <option value="FINANCIERA">Financiera</option>
            <option value="PROVEEDOR_A">Proveedor A</option>
            <option value="PROVEEDOR_B">Proveedor B</option>
            <option value="PROVEEDOR_C">Proveedor C</option>
            <option value="SIN_CATEGORIZAR">Sin categorizar</option>
          </select>
        </div>

        {/* Tabla de Comprobantes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comprobantesFiltraos.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {comp.cliente_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${comp.monto.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {comp.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      comp.estado === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comp.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {comprobantesFiltraos.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No hay comprobantes para mostrar
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
