import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Lock, 
  FileText,
  Scan,
  AlertTriangle,
  Barcode
} from 'lucide-react';

export const AuditoriaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertaConflicto, setAlertaConflicto] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Escaneo manual de código de barras
  const [codigoInput, setCodigoInput] = useState('');
  const [procesandoCodigo, setProcesandoCodigo] = useState(false);
  const [itemsEscaneados, setItemsEscaneados] = useState([]);

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

  // Procesar escaneo manual de código de barras
  const handleEscanear = async (e) => {
    e.preventDefault();
    if (!codigoInput.trim()) return;

    setError('');
    setAlertaConflicto('');
    setMensajeExito('');
    setProcesandoCodigo(true);

    const codigo = codigoInput.trim();

    try {
      await api.post(`/revisiones/${id}/escanear`, { codigoBarras: codigo });

      setMensajeExito(`Ítem con código ${codigo} registrado correctamente.`);
      setItemsEscaneados((prev) => [
        { codigoBarras: codigo, fechaEscaneo: new Date().toLocaleTimeString() },
        ...prev
      ]);
      setCodigoInput('');
    } catch (err) {
      if (err.response?.status === 409) {
        // Conflicto semántico: ya fue contabilizado en esta sesión
        setAlertaConflicto(`El código de barras "${codigo}" ya fue escaneado previamente en esta auditoría.`);
      } else if (err.response?.status === 404) {
        setError(`El código de barras "${codigo}" no existe en el catálogo maestro de inventario.`);
      } else if (err.response?.status === 400) {
        setError('La sesión de auditoría ya no está en curso.');
      } else {
        setError('Error al procesar el código de barras.');
      }
    } finally {
      setProcesandoCodigo(false);
    }
  };

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
      {/* Volver */}
      <button
        onClick={() => navigate('/revisiones')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Auditorías</span>
      </button>

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

      {/* Formulario de Escaneo por Código de Barras (Solo si está EnCurso) */}
      {revision?.estado === 'EnCurso' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Barcode className="w-5 h-5 text-indigo-400" />
            <span>Registro de Código de Barras</span>
          </h2>

          <form onSubmit={handleEscanear} className="flex gap-3">
            <input
              type="text"
              required
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              placeholder="Ingrese o escanee el código de barras..."
              className="flex-1 py-3 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={procesandoCodigo || !codigoInput.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {procesandoCodigo ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Scan className="w-4 h-4" />
              )}
              <span>Registrar</span>
            </button>
          </form>

          {/* Notificaciones del Escaneo */}
          {mensajeExito && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {alertaConflicto && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-400 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{alertaConflicto}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Historial de Ítems Procesados en Tiempo Real */}
      {itemsEscaneados.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-slate-300">Ítems Procesados en esta Sesión ({itemsEscaneados.length})</h3>
          <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto pr-2">
            {itemsEscaneados.map((item, index) => (
              <div key={index} className="py-2 flex items-center justify-between text-xs">
                <span className="font-mono text-indigo-400 font-semibold">{item.codigoBarras}</span>
                <span className="text-slate-500">{item.fechaEscaneo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                ? 'Ingresa los códigos de barras de los bienes encontrados. Al finalizar, la cobertura total se calculará de forma automática.'
                : 'Esta auditoría ha sido clausurada de forma permanente.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};