import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState({
  //   id: 12345,
  //   name: 'John Doe',
  //   role: 'employee', // or 'admin'
  // });
  

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const login = (userData) => {
    setUser(userData);
    try { localStorage.setItem('user', JSON.stringify(userData)); } catch {}
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem('user'); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
