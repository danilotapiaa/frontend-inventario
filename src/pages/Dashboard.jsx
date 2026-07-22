import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, ShieldCheck, ArrowRight, Layers, ScanLine } from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Saludo Principal */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            {isAdmin() ? 'Panel Administrador' : 'Panel de Control'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            ¡Bienvenido/a al Sistema!
          </h1>
          <p className="text-slate-400 text-base mt-2">
            Plataforma para la gestión centralizada de activos de inventario y ejecución de auditorías físicas mediante escaneo de código de barras.
          </p>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Elementos */}
          <Link
            to="/elementos"
            className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                Catálogo de Elementos
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                Consulta, registra y gestiona los activos físicos. Carga de imágenes y exportación a Excel.
              </p>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mt-6">
              <span>Gestionar Activos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card Revisiones */}
          <Link
            to="/revisiones"
            className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Auditorías / Revisiones
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                Inicia sesiones de auditoría física y escanea bienes mediante cámara en tiempo real.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mt-6">
              <span>Iniciar Escaneo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card Usuarios (Solo visible para Admin) */}
          {isAdmin() && (
            <Link
              to="/usuarios"
              className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  Gestión de Usuarios
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Panel exclusivo de administradores para ver y gestionar cuentas de usuario en el sistema.
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mt-6">
                <span>Administrar Usuarios</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};