import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';
import { Elementos } from './pages/Elementos';

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

        {/* Rutas Protegidas que requieren sesión activa */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/elementos" element={<Elementos />} />

            <Route 
              path="/revisiones" 
              element={
                <div className="max-w-7xl mx-auto p-8 text-center text-slate-400">
                  <h2 className="text-2xl font-bold text-white mb-2">Módulo de Auditorías</h2>
                  <p>Pendiente para el siguiente paso...</p>
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
                    <p>Pendiente para el siguiente paso...</p>
                  </div>
                } 
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;