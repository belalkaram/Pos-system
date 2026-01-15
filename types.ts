
export type Language = 'en' | 'ar';

export type UserRole = 'admin' | 'manager' | 'cashier' | 'accountant' | 'chef';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
}

export interface ProductVariant {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface ProductAddon {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface RecipeItem {
  inventoryItemId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  nameEn: string;
  nameAr: string;
  basePrice: number;
  cost: number;
  categoryId: string;
  image: string;
  available: boolean;
  variants: ProductVariant[];
  addons: ProductAddon[];
  recipe?: RecipeItem[]; // Linked ingredients
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
  selectedVariant?: ProductVariant;
  selectedAddons: ProductAddon[];
  totalItemPrice: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  amountReceived?: number;
  changeAmount?: number;
  customerId?: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  tableId?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  shiftId?: string;
  performedBy?: { name: string; role: string };
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  startBalance: number;
  endBalance?: number;
  expectedBalance?: number;
  totalSales: number;
  status: 'open' | 'closed';
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'bill_requested';
  currentOrderId?: string;
  x?: number;
  y?: number;
}

export interface AppSettings {
  restaurantNameEn: string;
  restaurantNameAr: string;
  branchNameAr: string;
  taxId: string;
  addressAr: string;
  phone: string;
  taxRate: number;
  serviceRate: number;
  currencyEn: string;
  currencyAr: string;
  printerName: string;
  printFormat: 'a4' | 'thermal';
  autoBackup: boolean;
  defaultAutoPrint?: boolean;
  defaultCompactView?: boolean;
  adminUsername?: string;
  adminPassword?: string;
}

export interface Notification {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
}

export interface InventoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  unit: string;
  minLevel: number;
  costPerUnit: number;
  warehouseQuantities: { [warehouseId: string]: number };
}

export interface StockMovement {
  id: string;
  itemId: string;
  warehouseId: string;
  type: 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'production';
  quantity: number;
  date: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  companyName?: string;
  balance: number;
}

export interface PurchaseItem {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  cost: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplierId?: string;
  supplierName?: string;
  warehouseId: string;
  invoiceNumber: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit';
  notes?: string;
  performedBy?: { name: string; role: string };
}

export interface TreasuryTransaction {
  id: string;
  type: 'income' | 'expense';
  category: 'purchases' | 'salaries' | 'sales' | 'general' | 'debt_payment' | 'rent' | 'maintenance' | 'utilities' | 'other';
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // Order ID or Invoice ID
  performedBy?: {
    name: string;
    role: string;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late';
}

export interface Loan {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Employee {
  id: string;
  nameEn: string;
  nameAr: string;
  role: string;
  baseSalary: number;
  penaltyDays: number;
  absenceDays: number;
  bonuses: number;
  insurance: number;
  status: 'active' | 'inactive';
  joinDate: string;
  leftDate?: string;
  shiftStart: string;
  shiftEnd: string;
  phone: string;
  username?: string;
  password?: string;
}
