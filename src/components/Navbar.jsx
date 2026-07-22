import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ShieldCheck, LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Enlaces */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-white tracking-wide">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Package className="w-5 h-5" />
              </div>
              <span>Inventario<span className="text-indigo-400">Pro</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-slate-800 text-indigo-400 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/elementos"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/elementos') 
                    ? 'bg-slate-800 text-indigo-400 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Elementos
              </Link>
              <Link
                to="/revisiones"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/revisiones') || location.pathname.startsWith('/revisiones/')
                    ? 'bg-slate-800 text-indigo-400 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Auditorías
              </Link>
            </div>
          </div>

          {/* Información del Usuario y Salir */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-slate-200 leading-none">
                  {user?.email}
                </span>
                <span className="text-xs mt-1">
                  {isAdmin() ? (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Administrador
                    </span>
                  ) : (
                    <span className="text-slate-400">Usuario Operativo</span>
                  )}
                </span>
              </div>
            </div>

            <Link
              to="/seguridad"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/seguridad')
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Seguridad de la cuenta"
            >
              <Shield className="w-5 h-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};