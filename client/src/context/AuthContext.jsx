import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      await refreshCounts();
    } catch (err) {
      console.error('Auth verification failed:', err);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCounts = async () => {
    if (!getAuthToken()) return;
    try {
      const favData = await api.getFavorites();
      setFavoriteCount(favData.favorites ? favData.favorites.length : 0);

      const convData = await api.getConversations();
      const totalUnread = (convData.conversations || []).reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setUnreadMsgCount(totalUnread);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (loginIdentifier, password) => {
    const data = await api.login({ login: loginIdentifier, password });
    setAuthToken(data.token);
    setUser(data.user);
    await refreshCounts();
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setAuthToken(data.token);
    setUser(data.user);
    await refreshCounts();
    return data;
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setFavoriteCount(0);
    setUnreadMsgCount(0);
  };

  const updateUserState = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUserState,
      refreshCounts,
      favoriteCount,
      unreadMsgCount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
