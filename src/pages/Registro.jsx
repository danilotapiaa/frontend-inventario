import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { validarCedulaEcuatoriana } from '../utils/cedula';
import { UserPlus, User, Mail, Lock, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

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

    // Validación matemática previa en el Frontend (Módulo 10)
    if (!validarCedulaEcuatoriana(formData.cedula)) {
      setError('La cédula ingresada no es una cédula ecuatoriana válida.');
      setCedulaValida(false);
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/registro', formData);
      navigate('/login', { state: { registroExitoso: true } });
    } catch (err) {
      console.error('Detalle del error en petición HTTP:', err);

      if (err.response?.status === 409) {
        setError('El correo electrónico o la cédula ya se encuentran registrados en el sistema.');
      } else if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (data.errors) {
          // Captura mensajes de validación devueltos por ASP.NET Core
          const mensajes = Object.values(data.errors).flat().join(' | ');
          setError(mensajes || 'Error de validación en los datos enviados.');
        } else {
          setError(data.message || data.title || 'Error devuelto por el servidor.');
        }
      } else if (err.message) {
        setError(`Error de comunicación con el backend: ${err.message}. Verifica que el API esté en http://localhost:5051`);
      } else {
        setError('No se pudo completar el registro. Intente de nuevo.');
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
            {/* Cédula con indicación del Módulo 10 */}
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
                  placeholder="0504883307"
                  className={`w-full pl-10 pr-10 py-3 bg-slate-950 border rounded-xl text-white placeholder-slate-500 focus:outline-none text-sm transition-all ${
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
                  placeholder="Danilo Tapia"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="djtapia7@espe.edu.ec"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cedulaValida === false}
              className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
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