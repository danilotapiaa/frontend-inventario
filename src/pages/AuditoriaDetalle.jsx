import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Lock, 
  FileText
} from 'lucide-react';

export const AuditoriaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState(null);

  const cargarDetalle = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/revisiones/${id}`);
      setRevision(response.data);
    } catch (err) {
      setError('No se pudo recuperar la información de esta auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const handleFinalizar = async () => {
    if (!window.confirm('¿Deseas clausurar definitivamente esta auditoría? Una vez cerrada no se podrá modificar.')) return;

    setFinalizando(true);
    setError('');
    try {
      const response = await api.post(`/revisiones/${id}/finalizar`);
      setResultadoFinal(response.data);
      cargarDetalle();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Acceso denegado: No tienes permisos para finalizar esta revisión.');
      } else {
        setError(err.response?.data?.message || 'Error al intentar clausurar la auditoría.');
      }
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Cargando detalles de la auditoría...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Botón regresar */}
      <button
        onClick={() => navigate('/revisiones')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Auditorías</span>
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Auditoría de Inventario</h1>
            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${
              revision?.estado === 'EnCurso'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : revision?.estado === 'Completada'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {revision?.estado}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">UUID: {revision?.id}</p>
        </div>

        {/* Botón Finalizar */}
        {revision?.estado === 'EnCurso' && (
          <button
            onClick={handleFinalizar}
            disabled={finalizando}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {finalizando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>Clausurar y Finalizar Sesión</span>
          </button>
        )}
      </div>

      {/* Resumen de la Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Marcas de Tiempo</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Fecha de Inicio:</span>
              <span className="text-slate-200 font-medium">
                {revision?.fechaInicio ? new Date(revision.fechaInicio).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Fecha de Cierre:</span>
              <span className="text-slate-200 font-medium">
                {revision?.fechaFin ? new Date(revision.fechaFin).toLocaleString() : 'En proceso...'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Resumen de Cobertura</span>
          </h2>
          {resultadoFinal ? (
            <div className="p-4 bg-slate-950 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Estado Final:</span>
                <span className="font-bold text-emerald-400">{resultadoFinal.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Elementos Faltantes:</span>
                <span className="font-bold text-white">{resultadoFinal.elementosFaltantes}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              {revision?.estado === 'EnCurso'
                ? 'La cobertura total y el conteo de elementos se calcularán automáticamente al momento de presionar "Clausurar y Finalizar Sesión".'
                : 'Esta auditoría ha sido clausurada.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};