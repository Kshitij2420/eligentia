import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('eligentia_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('eligentia_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eligentia_user');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('eligentia_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      localStorage.setItem('eligentia_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eligentia_token');
    localStorage.removeItem('eligentia_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
