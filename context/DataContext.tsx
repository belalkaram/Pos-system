
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { MenuItem, Order, InventoryItem, Employee, AppSettings, AttendanceRecord, Loan, Purchase, Warehouse, Customer, Supplier, TreasuryTransaction, StockMovement, Notification, Category, Table, CartItem, Shift } from '../types';
import {
  INITIAL_MENU, INITIAL_INVENTORY, INITIAL_EMPLOYEES, INITIAL_SETTINGS,
  INITIAL_ATTENDANCE, INITIAL_WAREHOUSES, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS,
  INITIAL_CATEGORIES, INITIAL_TREASURY
} from '../constants';
import { SEED_ORDERS, SEED_PURCHASES, SEED_TABLES, SEED_STOCK_MOVEMENTS } from '../seedData';

interface DataContextType {
  categories: Category[];
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;

  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  recallLastOrder: () => void;
  lastCompletedOrderId: string | null;
  nextOrderNumber: number;

  tables: Table[];
  addTable: (t: Table) => void;
  updateTable: (t: Table) => void;
  deleteTable: (id: string) => void;

  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  addInventoryItem: (item: InventoryItem) => void;
  editInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  transferStock: (itemId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, notes?: string) => void;

  warehouses: Warehouse[];
  addWarehouse: (w: Warehouse) => void;
  updateWarehouse: (w: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  stockMovements: StockMovement[];

  customers: Customer[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  treasury: TreasuryTransaction[];
  addTransaction: (t: TreasuryTransaction) => void;
  updateTransaction: (t: TreasuryTransaction) => void;
  deleteTransaction: (id: string) => void;

  purchases: Purchase[];
  addPurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;

  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;

  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;
  addManualAttendance: (record: AttendanceRecord) => void;

  loans: Loan[];
  addLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;

  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  updateSettings: (settings: AppSettings) => void;

  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Shift Management
  activeShift: Shift | null;
  shiftHistory: Shift[];
  openShift: (userId: string, userName: string, startBalance: number) => void;
  closeShift: (endBalance: number) => void;

  restoreData: (data: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('menuItems');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : SEED_ORDERS;
  });

  const [lastCompletedOrderId, setLastCompletedOrderId] = useState<string | null>(null);

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('tables');
    return saved ? JSON.parse(saved) : SEED_TABLES;
  });

  const [nextOrderNumber, setNextOrderNumber] = useState<number>(() => {
    const saved = localStorage.getItem('nextOrderNumber');
    if (saved) return parseInt(saved);
    return 1;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('warehouses');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('stockMovements');
    return saved ? JSON.parse(saved) : SEED_STOCK_MOVEMENTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [treasury, setTreasury] = useState<TreasuryTransaction[]>(() => {
    const saved = localStorage.getItem('treasury');
    return saved ? JSON.parse(saved) : INITIAL_TREASURY;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('purchases');
    if (saved) return JSON.parse(saved);
    return SEED_PURCHASES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Shift Logic
  const [activeShift, setActiveShift] = useState<Shift | null>(() => {
    const saved = localStorage.getItem('activeShift');
    return saved ? JSON.parse(saved) : null;
  });

  const [shiftHistory, setShiftHistory] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('shiftHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [
      { id: '1', titleAr: 'مرحباً بك', titleEn: 'Welcome', messageAr: 'تم تفعيل نظام سمارت جورميه بنجاح', messageEn: 'Smart Gourmet activated', type: 'success', createdAt: new Date().toISOString(), isRead: false }
    ];
  });

  // ==================== CRITICAL: حفظ الموظفين والإعدادات فوراً في localStorage ====================
  // هذا ضروري لأن AuthContext يقرأ منه عند تسجيل الدخول
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
    console.log('✅ Employees synced to localStorage:', employees.length);
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    console.log('✅ Settings synced to localStorage');
  }, [settings]);

  // ==================== PERSISTENCE LAYER (HYBRID) ====================
  // 1. Load authoritative data from Local File DB on startup
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        // @ts-ignore - ipcRenderer is exposed by preload.js
        if ((window as any).ipcRenderer) {
          const dbData = await (window as any).ipcRenderer.invoke('db-read');

          if (dbData) {
            console.log('✅ Loaded data from Local SQLite DB');
            if (dbData.categories) setCategories(dbData.categories);
            if (dbData.menuItems) setMenuItems(dbData.menuItems);
            if (dbData.orders) setOrders(dbData.orders);
            if (dbData.tables) setTables(dbData.tables);
            if (dbData.nextOrderNumber) setNextOrderNumber(dbData.nextOrderNumber);
            if (dbData.inventory) setInventory(dbData.inventory);
            if (dbData.warehouses) setWarehouses(dbData.warehouses);
            if (dbData.stockMovements) setStockMovements(dbData.stockMovements);
            if (dbData.customers) setCustomers(dbData.customers);
            if (dbData.suppliers) setSuppliers(dbData.suppliers);
            if (dbData.treasury) setTreasury(dbData.treasury);
            if (dbData.employees) setEmployees(dbData.employees);
            if (dbData.attendance) setAttendance(dbData.attendance);
            if (dbData.loans) setLoans(dbData.loans);
            if (dbData.purchases) setPurchases(dbData.purchases);
            if (dbData.settings) setSettings(dbData.settings);
            if (dbData.notifications) setNotifications(dbData.notifications);
            if (dbData.activeShift) setActiveShift(dbData.activeShift);
            if (dbData.shiftHistory) setShiftHistory(dbData.shiftHistory);
          }
        } else {
          console.log('ℹ️ Running in Browser Mode (no ipcRenderer)');
        }
      } catch (error) {
        console.error('Failed to load from DB:', error);
      }
    };
    loadFromDb();
  }, []);

  // 2. Save to Local File DB on any change (Debounced to prevent lag)
  useEffect(() => {
    const saveData = async () => {
      const fullData = {
        categories, menuItems, orders, tables, nextOrderNumber, inventory,
        warehouses, stockMovements, customers, suppliers, treasury, employees,
        attendance, loans, purchases, settings, notifications, activeShift, shiftHistory
      };

      try {
        // @ts-ignore - ipcRenderer is exposed by preload.js
        const ipc = (window as any).ipcRenderer;
        if (ipc) {
          console.log('📤 Attemping to save to SQLite via ipcRenderer...');
          console.log('📊 Data to save - Employees count:', fullData.employees?.length || 0);

          const success = await ipc.invoke('db-write', fullData);
          console.log('📥 db-write result:', success);

          if (success) {
            console.log('✅ Successfully saved to SQLite Database');
            return; // Stop here, don't save to localStorage
          } else {
            console.warn('⚠️ db-write returned false - check db-service logs');
          }
        } else {
          console.log('ℹ️ No ipcRenderer found - running in browser mode');
        }
      } catch (error) {
        console.error('❌ Failed to save to SQLite:', error);
      }

      // Fallback to LocalStorage only if SQLite failed or running in browser
      console.warn('⚠️ Saving to LocalStorage (Fallback)');
      localStorage.setItem('pos_cache', JSON.stringify(fullData));
    };

    const handler = setTimeout(saveData, 2000); // Save every 2 seconds of inactivity
    return () => clearTimeout(handler);
  }, [
    categories, menuItems, orders, tables, nextOrderNumber, inventory,
    warehouses, stockMovements, customers, suppliers, treasury, employees,
    attendance, loans, purchases, settings, notifications, activeShift, shiftHistory
  ]);

  // تزامن بين الـ tabs - لما tab تانية تعدل في البيانات، الـ tab دي هتتحدث تلقائياً
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;

      try {
        const newData = JSON.parse(e.newValue);

        switch (e.key) {
          case 'orders':
            setOrders(newData);
            break;
          case 'categories':
            setCategories(newData);
            break;
          case 'menuItems':
            setMenuItems(newData);
            break;
          case 'tables':
            setTables(newData);
            break;
          case 'inventory':
            setInventory(newData);
            break;
          case 'warehouses':
            setWarehouses(newData);
            break;
          case 'customers':
            setCustomers(newData);
            break;
          case 'suppliers':
            setSuppliers(newData);
            break;
          case 'treasury':
            setTreasury(newData);
            break;
          case 'employees':
            setEmployees(newData);
            break;
          case 'attendance':
            setAttendance(newData);
            break;
          case 'purchases':
            setPurchases(newData);
            break;
          case 'settings':
            setSettings(newData);
            break;
          case 'notifications':
            setNotifications(newData);
            break;
          case 'activeShift':
            setActiveShift(newData);
            break;
          case 'shiftHistory':
            setShiftHistory(newData);
            break;
          case 'nextOrderNumber':
            setNextOrderNumber(parseInt(e.newValue) || 1);
            break;
        }
      } catch (error) {
        console.error('Error syncing data from other tab:', error);
      }
    };

    // الاستماع لتغييرات localStorage من tabs أخرى
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addNotification = (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: Notification = { ...n, id: Date.now().toString(), createdAt: new Date().toISOString(), isRead: false };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const clearNotifications = () => setNotifications([]);

  const addCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const updateCategory = (c: Category) => setCategories(prev => prev.map(cat => cat.id === c.id ? c : cat));
  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
    addNotification({ titleAr: 'صنف جديد', titleEn: 'New Item', messageAr: `تم إضافة الصنف: ${item.nameAr}`, messageEn: `Added item: ${item.nameEn}`, type: 'success' });
  };
  const updateMenuItem = (item: MenuItem) => setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteMenuItem = (id: string) => setMenuItems(prev => prev.filter(i => i.id !== id));

  const addTable = (t: Table) => setTables(prev => [...prev, t]);
  const updateTable = (t: Table) => setTables(prev => prev.map(tbl => tbl.id === t.id ? t : tbl));
  const deleteTable = (id: string) => setTables(prev => prev.filter(t => t.id !== id));

  const addWarehouse = (w: Warehouse) => setWarehouses(prev => [...prev, w]);
  const updateWarehouse = (w: Warehouse) => setWarehouses(prev => prev.map(wh => wh.id === w.id ? w : wh));
  const deleteWarehouse = (id: string) => setWarehouses(prev => prev.filter(w => w.id !== id));

  const addCustomer = (c: Customer) => setCustomers(prev => [...prev, c]);
  const updateCustomer = (c: Customer) => setCustomers(prev => prev.map(cust => cust.id === c.id ? c : cust));
  const deleteCustomer = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));

  const addSupplier = (s: Supplier) => setSuppliers(prev => [...prev, s]);
  const updateSupplier = (s: Supplier) => setSuppliers(prev => prev.map(sup => sup.id === s.id ? s : sup));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  const addTransaction = (t: TreasuryTransaction) => setTreasury(prev => [t, ...prev]);
  const updateTransaction = (t: TreasuryTransaction) => setTreasury(prev => prev.map(old => old.id === t.id ? t : old));
  const deleteTransaction = (id: string) => setTreasury(prev => prev.filter(t => t.id !== id));

  const addInventoryItem = (item: InventoryItem) => setInventory(prev => [...prev, item]);
  const editInventoryItem = (item: InventoryItem) => setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteInventoryItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));

  const transferStock = (itemId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, notes?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const fromQty = item.warehouseQuantities[fromWarehouseId] || 0;
        const toQty = item.warehouseQuantities[toWarehouseId] || 0;
        if (fromQty < quantity) return item;
        return { ...item, warehouseQuantities: { ...item.warehouseQuantities, [fromWarehouseId]: fromQty - quantity, [toWarehouseId]: toQty + quantity } };
      }
      return item;
    }));
  };

  const addOrder = (order: Order) => {
    // تعيين معرف الوردية إذا كانت موجودة، أو تسجيله كطلب مباشر (للأدمن)
    const finalOrder = { ...order, shiftId: activeShift ? activeShift.id : undefined };
    setOrders(prev => [finalOrder, ...prev]);
    setNextOrderNumber(prev => prev + 1);

    // تحديث مبيعات الوردية النشطة فقط إذا كانت موجودة
    if (activeShift) {
      setActiveShift({
        ...activeShift,
        totalSales: activeShift.totalSales + order.total
      });
    }

    if (order.type === 'dine-in' && order.tableId) {
      setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'occupied', currentOrderId: order.id } : t));
    }

    // تسجيل في الخزينة بشكل طبيعي كإيراد مبيعات
    addTransaction({
      id: Date.now().toString(),
      type: 'income',
      category: 'sales',
      amount: order.total,
      date: new Date().toISOString(),
      description: `Order #${order.id}`,
      referenceId: order.id,
      performedBy: order.performedBy
    });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    if (status === 'completed') setLastCompletedOrderId(id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (status === 'completed' || status === 'cancelled') {
      const order = orders.find(o => o.id === id);
      if (order && order.tableId) setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t));
    }
  };

  const recallLastOrder = () => {
    if (!lastCompletedOrderId) return;
    setOrders(prev => prev.map(o => o.id === lastCompletedOrderId ? { ...o, status: 'ready' } : o));
    setLastCompletedOrderId(null);
  };

  const addPurchase = (purchase: Purchase) => {
    setPurchases(prev => [purchase, ...prev]);
    purchase.items.forEach(pItem => {
      setInventory(prev => prev.map(inv => {
        if (inv.id === pItem.inventoryItemId) {
          const currentQty = inv.warehouseQuantities[purchase.warehouseId] || 0;
          return { ...inv, warehouseQuantities: { ...inv.warehouseQuantities, [purchase.warehouseId]: currentQty + pItem.quantity } };
        }
        return inv;
      }));
    });
    addTransaction({
      id: Date.now().toString(),
      type: 'expense',
      category: 'purchases',
      amount: purchase.totalAmount,
      date: new Date().toISOString(),
      description: `Purchase Inv #${purchase.invoiceNumber}`,
      referenceId: purchase.id,
      performedBy: purchase.performedBy
    });
  };

  const deletePurchase = (id: string) => setPurchases(prev => prev.filter(p => p.id !== id));

  const addEmployee = (e: Employee) => setEmployees(prev => [...prev, e]);
  const updateEmployee = (e: Employee) => setEmployees(prev => prev.map(emp => emp.id === e.id ? e : emp));
  const deleteEmployee = (id: string) => setEmployees(prev => prev.filter(emp => emp.id !== id));

  const checkIn = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance(prev => [{ id: Date.now().toString(), employeeId, date: today, checkIn: new Date().toISOString(), hoursWorked: 0, status: 'present' }, ...prev]);
  };

  const checkOut = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance(prev => prev.map(record => {
      if (record.employeeId === employeeId && record.date === today && !record.checkOut) {
        const checkOutTime = new Date();
        const checkInTime = new Date(record.checkIn);
        const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        return { ...record, checkOut: checkOutTime.toISOString(), hoursWorked: parseFloat(hours.toFixed(2)) };
      }
      return record;
    }));
  };

  const addManualAttendance = (record: AttendanceRecord) => setAttendance(prev => [record, ...prev]);
  const addLoan = (loan: Loan) => setLoans(prev => [loan, ...prev]);
  const deleteLoan = (id: string) => setLoans(prev => prev.filter(l => l.id !== id));
  const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

  const openShift = (userId: string, userName: string, startBalance: number) => {
    const newShift: Shift = {
      id: `SH-${Date.now()}`,
      userId,
      userName,
      startTime: new Date().toISOString(),
      startBalance,
      totalSales: 0,
      status: 'open'
    };
    setActiveShift(newShift);
    addNotification({
      titleAr: 'تم فتح الوردية', titleEn: 'Shift Opened',
      messageAr: `تم بدء وردية جديدة للمستخدم: ${userName}`, messageEn: `New shift started by: ${userName}`,
      type: 'info'
    });
  };

  const closeShift = (endBalance: number) => {
    if (!activeShift) return;
    const closedShift: Shift = {
      ...activeShift,
      endTime: new Date().toISOString(),
      endBalance,
      expectedBalance: activeShift.startBalance + activeShift.totalSales,
      status: 'closed'
    };
    setShiftHistory(prev => [closedShift, ...prev]);
    setActiveShift(null);
    addNotification({
      titleAr: 'تم إغلاق الوردية', titleEn: 'Shift Closed',
      messageAr: `تم إغلاق وردية المستخدم: ${closedShift.userName}`, messageEn: `Shift closed for: ${closedShift.userName}`,
      type: 'success'
    });
  };

  const restoreData = (data: any) => {
    if (data.categories) setCategories(data.categories);
    if (data.menuItems) setMenuItems(data.menuItems);
    if (data.orders) setOrders(data.orders);
    if (data.settings) setSettings(data.settings);
  };

  return (
    <DataContext.Provider value={{
      categories, addCategory, updateCategory, deleteCategory,
      menuItems, setMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
      orders, setOrders, addOrder, updateOrderStatus, recallLastOrder, lastCompletedOrderId, nextOrderNumber,
      tables, addTable, updateTable, deleteTable,
      inventory, setInventory, addInventoryItem, editInventoryItem, deleteInventoryItem, transferStock,
      warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
      stockMovements,
      customers, addCustomer, updateCustomer, deleteCustomer,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      treasury, addTransaction, updateTransaction, deleteTransaction,
      purchases, addPurchase, deletePurchase,
      employees, setEmployees, addEmployee, updateEmployee, deleteEmployee,
      attendance, setAttendance, checkIn, checkOut, addManualAttendance,
      loans, addLoan, deleteLoan,
      settings, setSettings, updateSettings,
      notifications, addNotification, markAsRead, clearNotifications,
      activeShift, shiftHistory, openShift, closeShift,
      restoreData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
