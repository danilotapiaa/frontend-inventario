import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { validarCedulaEcuatoriana } from '../utils/cedula';
import { UserPlus, User, Mail, Lock, CreditCard, AlertCircle, CheckCircle2, Check, X } from 'lucide-react';

export const Registro = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    email: '',
    password: '',
  });

  const [cedulaValida, setCedulaValida] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reglas de validación de contraseña
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordSecure = Object.values(passwordRules).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'cedula') {
      if (value.length === 10) {
        setCedulaValida(validarCedulaEcuatoriana(value));
      } else {
        setCedulaValida(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validarCedulaEcuatoriana(formData.cedula)) {
      setError('La cédula ecuatoriana ingresada no es válida (Error Módulo 10).');
      setCedulaValida(false);
      return;
    }

    if (!isPasswordSecure) {
      setError('La contraseña no cumple con los requisitos mínimos de seguridad.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/registro', formData);
      navigate('/login', { state: { registroExitoso: true } });
    } catch (err) {
      if (err.response?.status === 409) {
        setError('El correo electrónico o la cédula ya se encuentran registrados.');
      } else if (err.response?.data) {
        const data = err.response.data;
        if (data.errors) {
          const mensajes = Object.values(data.errors).flat().join(' | ');
          setError(mensajes);
        } else {
          setError(data.message || data.title || 'Error al procesar el registro.');
        }
      } else {
        setError('No se pudo establecer conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4">
            <UserPlus className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Crear una Cuenta</h2>
          <p className="text-slate-400 text-sm mt-2">Registro de Autoservicio de Usuarios</p>
        </div>

        {/* Formulario */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm break-words">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cédula */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Cédula Ecuatoriana
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="cedula"
                  maxLength={10}
                  required
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="1700000000"
                  className={`w-full pl-10 pr-10 py-3 bg-slate-950 border rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm transition-all ${
                    cedulaValida === true 
                      ? 'border-emerald-500/50 focus:border-emerald-500' 
                      : cedulaValida === false 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {cedulaValida === true && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {cedulaValida === false && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
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
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Contraseña y Verificador de Requisitos */}
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-white placeholder-slate-600 focus:outline-none text-sm transition-all ${
                    formData.password.length > 0
                      ? isPasswordSecure
                        ? 'border-emerald-500/50 focus:border-emerald-500'
                        : 'border-amber-500/50 focus:border-amber-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Indicadores de fortaleza de contraseña */}
              {formData.password.length > 0 && (
                <div className="mt-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <span className="block font-semibold text-slate-400 mb-1">Requisitos de la contraseña:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-1.5 ${passwordRules.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordRules.minLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordRules.hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordRules.hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Al menos 1 mayúscula</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordRules.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordRules.hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Al menos 1 minúscula</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordRules.hasNumberOrSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {passwordRules.hasNumberOrSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>1 número o símbolo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || cedulaValida !== true || !isPasswordSecure}
              className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Registrar Cuenta</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};