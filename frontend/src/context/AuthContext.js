import React, { createContext, useState, useContext, use, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState({
  //   id: 12345,
  //   name: 'John Doe',
  //   role: 'employee', // or 'admin'
  // });
  

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const[isReady, setIsReady] = useState(false);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axiosInstance.get('/api/auth/profile');
        if (response.data) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const login = (userData) => {
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {
        isReady ? children : <div>Loading...</div>
      }
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
