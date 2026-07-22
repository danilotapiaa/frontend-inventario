import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldOff, KeyRound, AlertCircle, CheckCircle2, Copy } from 'lucide-react';

export const Seguridad = () => {
  const { user } = useAuth();

  const [loadingEstado, setLoadingEstado] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Estado del flujo de activación
  const [qrCode, setQrCode] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [codigoActivar, setCodigoActivar] = useState('');
  const [generandoQr, setGenerandoQr] = useState(false);
  const [activando, setActivando] = useState(false);

  // Estado del flujo de desactivación
  const [codigoDesactivar, setCodigoDesactivar] = useState('');
  const [desactivando, setDesactivando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarEstado = async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get(`/usuarios/${user.id}`);
        setMfaEnabled(!!data.mfaEnabled);
      } catch {
        setError('No se pudo obtener el estado actual de MFA.');
      } finally {
        setLoadingEstado(false);
      }
    };
    cargarEstado();
  }, [user?.id]);

  const limpiarMensajes = () => {
    setError('');
    setMensaje('');
  };

  const handleGenerarQr = async () => {
    limpiarMensajes();
    setGenerandoQr(true);
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setQrCode(data.qrCodeImagenBase64);
      setSecretKey(data.secretKey);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo generar el código QR.');
    } finally {
      setGenerandoQr(false);
    }
  };

  const handleActivar = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setActivando(true);
    try {
      const { data } = await api.post('/auth/mfa/activar', { codigo: codigoActivar });
      setMensaje(data.mensaje || 'MFA activado con éxito.');
      setMfaEnabled(true);
      setQrCode(null);
      setSecretKey(null);
      setCodigoActivar('');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Código incorrecto. Inténtelo nuevamente.');
    } finally {
      setActivando(false);
    }
  };

  const handleDesactivar = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setDesactivando(true);
    try {
      const { data } = await api.post('/auth/mfa/desactivar', { codigo: codigoDesactivar });
      setMensaje(data.mensaje || 'MFA desactivado con éxito.');
      setMfaEnabled(false);
      setCodigoDesactivar('');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Código incorrecto. Inténtelo nuevamente.');
    } finally {
      setDesactivando(false);
    }
  };

  const copiarSecreto = async () => {
    if (!secretKey) return;
    try {
      await navigator.clipboard.writeText(secretKey);
      setMensaje('Secreto copiado al portapapeles.');
    } catch {
      /* portapapeles no disponible, se ignora */
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Seguridad de la Cuenta</h1>
        <p className="text-slate-400 text-sm mt-2">
          Configura la autenticación de dos factores (Google Authenticator) para tu cuenta.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mensaje && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {loadingEstado ? (
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Cargando estado de seguridad...
          </div>
        ) : mfaEnabled ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">MFA Activo</h2>
                <p className="text-slate-400 text-sm">
                  Tu cuenta exige un código de Google Authenticator en cada inicio de sesión.
                </p>
              </div>
            </div>

            <form onSubmit={handleDesactivar} className="space-y-4 border-t border-slate-800 pt-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Desactivar MFA
              </label>
              <p className="text-slate-500 text-xs">
                Ingresa el código de 6 dígitos vigente para confirmar la desactivación.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={codigoDesactivar}
                  onChange={(e) => setCodigoDesactivar(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center tracking-[0.4em] font-mono text-lg placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={desactivando || codigoDesactivar.length !== 6}
                  className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShieldOff className="w-4 h-4" />
                  {desactivando ? 'Desactivando...' : 'Desactivar'}
                </button>
              </div>
            </form>
          </>
        ) : qrCode ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Escanea el código QR</h2>
                <p className="text-slate-400 text-sm">
                  Usa Google Authenticator (o app compatible) para escanear el código.
                </p>
              </div>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-2xl">
              <img src={qrCode} alt="Código QR para MFA" className="w-56 h-56" />
            </div>

            {secretKey && (
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Clave manual</p>
                  <p className="text-sm text-slate-200 font-mono truncate">{secretKey}</p>
                </div>
                <button
                  type="button"
                  onClick={copiarSecreto}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  title="Copiar secreto"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleActivar} className="space-y-4 border-t border-slate-800 pt-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confirmar activación
              </label>
              <p className="text-slate-500 text-xs">
                Ingresa el código de 6 dígitos que muestra la app para confirmar la activación.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={codigoActivar}
                  onChange={(e) => setCodigoActivar(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center tracking-[0.4em] font-mono text-lg placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={activando || codigoActivar.length !== 6}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {activando ? 'Verificando...' : 'Confirmar y Activar'}
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={() => {
                setQrCode(null);
                setSecretKey(null);
                limpiarMensajes();
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400">
                <ShieldOff className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">MFA Inactivo</h2>
                <p className="text-slate-400 text-sm">
                  Activa la autenticación de dos factores para proteger tu cuenta.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerarQr}
              disabled={generandoQr}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {generandoQr ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {generandoQr ? 'Generando...' : 'Activar MFA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
