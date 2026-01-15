
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole, Employee } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
  currentEmployee: Employee | null;
  isLoading: boolean; // حالة التحميل
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// دالة لقراءة البيانات من localStorage فوراً (قبل الـ render)
const getInitialAuthState = () => {
  try {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedUserName = localStorage.getItem('userName');
    const savedEmp = localStorage.getItem('currentEmployee');

    if (savedAuth === 'true' && savedRole) {
      return {
        isAuthenticated: true,
        user: savedUserName || 'المستخدم',
        userRole: savedRole,
        currentEmployee: savedEmp ? JSON.parse(savedEmp) : null,
        isLoading: false
      };
    }
  } catch (error) {
    console.error('Error reading auth state:', error);
  }

  return {
    isAuthenticated: false,
    user: null,
    userRole: null,
    currentEmployee: null,
    isLoading: false
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // تهيئة الـ state مباشرة من localStorage (ليس في useEffect)
  const initialState = getInitialAuthState();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialState.isAuthenticated);
  const [user, setUser] = useState<string | null>(initialState.user);
  const [userRole, setUserRole] = useState<UserRole | null>(initialState.userRole);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(initialState.currentEmployee);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (u: string, p: string): Promise<boolean> => {
    const usernameInput = u.trim().toLowerCase();
    const passwordInput = p.trim();

    // Try to load settings and employees from DB via IPC if available
    let savedSettings: any = {};
    let savedEmployees: Employee[] = [];

    // Check if in Electron
    if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
      try {
        const dbData = await (window as any).ipcRenderer.invoke('db-read');
        if (dbData) {
          savedSettings = dbData.settings || {};
          savedEmployees = dbData.employees || [];
          // Update localStorage just in case
          localStorage.setItem('settings', JSON.stringify(savedSettings));
          localStorage.setItem('employees', JSON.stringify(savedEmployees));
        } else {
          // Fallback to localStorage
          savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
          savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        }
      } catch (e) {
        console.error("Auth DB Read Failed", e);
        // Fallback
        savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      }
    } else {
      // Browser Mode
      savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
      savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    }

    const adminUser = (savedSettings.adminUsername || 'admin').toLowerCase();
    const adminPass = savedSettings.adminPassword || '123456';

    let role: UserRole | null = null;
    let displayName = '';
    let empRecord: Employee | null = null;

    // 1. Check Admin
    if (usernameInput === adminUser && passwordInput === adminPass) {
      role = 'admin';
      displayName = savedSettings.restaurantNameAr || 'مدير النظام';
    }
    // 2. Check Employees
    else {
      const foundEmp = savedEmployees.find(e =>
        e.username?.toLowerCase() === usernameInput &&
        e.password === passwordInput
      );

      if (foundEmp) {
        empRecord = foundEmp;
        displayName = foundEmp.nameAr;
        // Map roles
        const roleMap: Record<string, UserRole> = {
          'كاشير': 'cashier', 'محاسب': 'accountant', 'مدير': 'manager', 'شيف': 'chef', 'مدير النظام': 'admin',
          'cashier': 'cashier', 'accountant': 'accountant', 'manager': 'manager', 'chef': 'chef', 'admin': 'admin'
        };
        role = roleMap[foundEmp.role] || 'cashier';
      }
    }

    if (role) {
      setIsAuthenticated(true);
      setUser(displayName);
      setUserRole(role);
      setCurrentEmployee(empRecord);

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', displayName);
      if (empRecord) localStorage.setItem('currentEmployee', JSON.stringify(empRecord));
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setCurrentEmployee(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentEmployee');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, user, currentEmployee, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
