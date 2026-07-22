import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';

// Layout Principal con la Barra de Navegación
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas Protegidas que llevan Navbar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Vistas temporales de la Fase 1 mientras desarrollamos la Fase 2 y 3 */}
            <Route 
              path="/elementos" 
              element={
                <div className="max-w-7xl mx-auto p-8 text-center text-slate-400">
                  <h2 className="text-2xl font-bold text-white mb-2">Módulo de Elementos</h2>
                  <p>A desarrollar en la siguiente fase...</p>
                </div>
              } 
            />
            <Route 
              path="/revisiones" 
              element={
                <div className="max-w-7xl mx-auto p-8 text-center text-slate-400">
                  <h2 className="text-2xl font-bold text-white mb-2">Módulo de Auditorías</h2>
                  <p>A desarrollar en la siguiente fase...</p>
                </div>
              } 
            />

            {/* Ruta Exclusiva de Administradores */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route 
                path="/usuarios" 
                element={
                  <div className="max-w-7xl mx-auto p-8 text-center text-slate-400">
                    <h2 className="text-2xl font-bold text-amber-400 mb-2">Panel Administrativo de Usuarios</h2>
                    <p>A desarrollar en la siguiente fase...</p>
                  </div>
                } 
              />
            </Route>
          </Route>
        </Route>

        {/* Redirección Por Defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;