import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Segundo factor (MFA)
  const [challengeToken, setChallengeToken] = useState(null);
  const [codigoMfa, setCodigoMfa] = useState('');
  const [verificandoMfa, setVerificandoMfa] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.requiereMfa) {
        setChallengeToken(response.data.challengeToken);
      } else {
        login(response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Credenciales inválidas. Verifique correo y contraseña.');
      } else if (err.response?.status === 429) {
        setError(err.response?.data?.mensaje || 'Demasiados intentos. Intente más tarde.');
      } else {
        setError(err.response?.data?.message || 'Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarMfa = async (e) => {
    e.preventDefault();
    setError('');
    setVerificandoMfa(true);

    try {
      const response = await api.post('/auth/mfa/login-verificar', {
        challengeToken,
        codigo: codigoMfa,
      });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response?.data?.mensaje || 'Código MFA incorrecto o expirado.');
      } else {
        setError(err.response?.data?.mensaje || 'Error al verificar el código.');
      }
    } finally {
      setVerificandoMfa(false);
    }
  };

  const volverALogin = () => {
    setChallengeToken(null);
    setCodigoMfa('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4">
            {challengeToken ? <ShieldCheck className="w-10 h-10" /> : <Package className="w-10 h-10" />}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {challengeToken ? 'Verificación en Dos Pasos' : 'Iniciar Sesión'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {challengeToken
              ? 'Ingresa el código de 6 dígitos de tu app de autenticación.'
              : 'Sistema de Gestión de Inventario y Auditoría'}
          </p>
        </div>

        {/* Formulario */}
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
                disabled={verificandoMfa || codigoMfa.length !== 6}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {verificandoMfa ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verificar Código</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={volverALogin}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!challengeToken && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">o continúa con</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <a
                href={`${API_BASE_URL}/auth/oauth/google/iniciar`}
                className="mt-4 w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.29 5.37l3.98-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
                </svg>
                Continuar con Google
              </a>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-400">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/registro" className="text-indigo-400 font-semibold hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
