import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch the user profile using the secure cookie
    const initAuth = async () => {
      try {
        const data = await getCurrentUser();
        // Handle standard backend response structures
        const userData = data.data?.user || data.data?.doc || data;
        setUser(userData);
      } catch (error) {
        console.error("Session expired or not logged in");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    // We no longer manually manage the token. The cookie is set by the backend.
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Hit backend to clear the cookie (if your backend has this route)
      await apiClient.get('/users/logout').catch(() => {});
    } catch(err) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
