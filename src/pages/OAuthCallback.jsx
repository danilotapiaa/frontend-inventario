import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

const MENSAJES_ERROR = {
  acceso_denegado: 'Cancelaste el inicio de sesión con Google.',
  solicitud_invalida: 'La solicitud de Google llegó incompleta. Intenta de nuevo.',
  estado_invalido: 'La sesión de autenticación expiró o no es válida. Intenta de nuevo.',
  oauth_no_configurado: 'El login con Google no está disponible en este momento.',
  intercambio_fallido: 'No se pudo completar la autenticación con Google. Intenta de nuevo.',
  token_invalido: 'Google devolvió una respuesta que no se pudo validar. Intenta de nuevo.',
  email_no_verificado: 'Tu cuenta de Google no tiene el correo verificado, no se puede continuar.',
  fallo_oauth: 'Ocurrió un error inesperado autenticando con Google.',
};

export const OAuthCallback = () => {
  const [error, setError] = useState('');
  const [codigoMfa, setCodigoMfa] = useState('');
  const [challengeToken, setChallengeToken] = useState(null);
  const [verificando, setVerificando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const errorCode = params.get('error');
    if (errorCode) {
      setError(MENSAJES_ERROR[errorCode] || 'No se pudo completar el inicio de sesión con Google.');
      return;
    }

    const token = params.get('token');
    if (token) {
      login(token);
      navigate('/dashboard', { replace: true });
      return;
    }

    if (params.get('requiereMfa') === 'true' && params.get('challengeToken')) {
      setChallengeToken(params.get('challengeToken'));
      return;
    }

    setError('No se recibió ninguna respuesta válida de Google.');
  }, [login, navigate]);

  const handleVerificarMfa = async (e) => {
    e.preventDefault();
    setError('');
    setVerificando(true);

    try {
      const response = await api.post('/auth/mfa/login-verificar', {
        challengeToken,
        codigo: codigoMfa,
      });
      login(response.data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Código MFA incorrecto o expirado.');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {challengeToken ? 'Verificación en Dos Pasos' : 'Iniciando sesión con Google'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {challengeToken
              ? 'Ingresa el código de 6 dígitos de tu app de autenticación.'
              : 'Procesando la respuesta de Google...'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {challengeToken ? (
            <form onSubmit={handleVerificarMfa} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={codigoMfa}
                  onChange={(e) => setCodigoMfa(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center tracking-[0.4em] font-mono text-lg placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={verificando || codigoMfa.length !== 6}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {verificando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verificar Código</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : error ? (
            <Link
              to="/login"
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              Volver al inicio de sesión
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-3 text-slate-400 text-sm py-4">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Redirigiendo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
