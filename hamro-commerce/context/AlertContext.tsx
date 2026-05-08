import React, { createContext, useContext, useState, useCallback } from 'react';

interface AlertType {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

interface AlertContextType {
  alerts: AlertType[];
  showAlert: (alert: Omit<AlertType, 'id'>) => void;
  removeAlert: (id: number) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [nextId, setNextId] = useState(1);

  const showAlert = useCallback((alert: Omit<AlertType, 'id'>) => {
    const newAlert: AlertType = {
      ...alert,
      id: nextId,
      autoClose: alert.autoClose !== false,
      duration: alert.duration || 5000,
    };
    setAlerts((prev) => [...prev, newAlert]);
    setNextId((prev) => prev + 1);
  }, [nextId]);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
