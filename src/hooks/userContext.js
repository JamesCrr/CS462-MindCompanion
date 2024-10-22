import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [identity, setIdentity] = useState(null);

  const retrieveIdentity = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed) {
          setIdentity(parsed);
        }
      }
      return userData;
    } catch (e) {
      console.error('Error retrieving identity:', e);
    }
  };

  const login = async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setIdentity(user);  // Update the identity after login
    } catch (e) {
      console.error('Error during login:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setIdentity(null);  // Clear the identity after logout
    } catch (e) {
      console.error('Error during logout:', e);
    }
  };

  useEffect(() => {
    retrieveIdentity();
  }, []);

  return (
    <UserContext.Provider value={{identity, login, logout, retrieveIdentity}}>
      {children}
    </UserContext.Provider>
  );
};
