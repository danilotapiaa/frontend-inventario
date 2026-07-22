import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Mapeo de Claims de .NET 10 (System.IdentityModel.Tokens.Jwt)
        const userData = {
          id: decoded.nameid || decoded.UsuarioId || decoded.sub,
          email: decoded.email || decoded.sub,
          rol: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User',
        };
        setUser(userData);
      } catch (error) {
        console.error('Token inválido o expirado:', error);
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (jwtToken) => {
    localStorage.setItem('jwt_token', jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.rol === 'Admin';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
        isAdmin, 
        isAuthenticated: !!user, 
        loading 
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};