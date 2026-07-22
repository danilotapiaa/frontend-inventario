import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, ClipboardList, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const Revisiones = () => {
  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cargarRevisiones = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/revisiones');
      setRevisiones(response.data);
    } catch (err) {
      setError('Error al recuperar las sesiones de auditoría del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRevisiones();
  }, []);

  const handleCrearRevision = async () => {
    setCreando(true);
    setError('');
    try {
      const response = await api.post('/revisiones');
      // Si retorna ID o el objeto con ID
      const newId = response.data?.id || response.data;
      if (newId) {
        navigate(`/revisiones/${newId}`);
      } else {
        cargarRevisiones();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al inicializar la sesión de auditoría.');
    } finally {
      setCreando(false);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'EnCurso':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> En Curso
          </span>
        );
      case 'Completada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Completada
          </span>
        );
      case 'Incompleta':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> Incompleta
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{estado}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Sesiones de Auditoría</h1>
          <p className="text-slate-400 text-sm mt-1">Histórico y control de revisiones físicas de inventario</p>
        </div>

        <button
          onClick={handleCrearRevision}
          disabled={creando}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {creando ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Iniciar Nueva Auditoría</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Cargando sesiones de auditoría...</span>
          </div>
        ) : revisiones.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto" />
            <p>No se registran auditorías en el sistema. Haz clic en "Iniciar Nueva Auditoría" para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ID de Sesión</th>
                  <th className="py-3.5 px-4">Fecha de Inicio</th>
                  <th className="py-3.5 px-4">Fecha Cierre</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {revisiones.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">
                      {rev.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {rev.fechaInicio ? new Date(rev.fechaInicio).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {rev.fechaFin ? new Date(rev.fechaFin).toLocaleString() : '---'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(rev.estado)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/revisiones/${rev.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Auditoría</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};