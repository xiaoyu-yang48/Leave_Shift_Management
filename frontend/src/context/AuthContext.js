import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../axiosConfig';

const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState({
  //   id: 12345,
  //   name: 'John Doe',
  //   role: 'employee', // or 'admin'
  // });
  

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    if (userData?.token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${userData.token}`;
    }
  };

  const logout = () => {
    setUser(null);
    delete axiosInstance.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
