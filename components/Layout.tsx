
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Archive, Users, Settings,
  LogOut, Menu as MenuIcon, FileText, BarChart3, UtensilsCrossed,
  Truck, Landmark, Wallet, Warehouse, Bell, X, Trash, Grid, Info as InfoIcon,
  PanelLeftClose, PanelLeft, ShieldCheck, ChefHat, LayoutGrid, Search, Command,
  ChevronLeft, ChevronDown, History, Sun, Moon, BookOpen, Factory,
  UserCheck, Receipt, Building2, Calculator, Car, CreditCard, Package,
  ClipboardList, Target, TrendingUp, Banknote, FileSpreadsheet, UserCog,
  Clock, DollarSign, Route, BarChart, Database, Shield, HardDrive
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

// تعريف هيكل القائمة الجانبية - 13 قسم رئيسي
interface SubMenuItem {
  path: string;
  labelAr: string;
  labelEn: string;
  icon: any;
}

interface MenuItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: any;
  path?: string;
  subItems?: SubMenuItem[];
}

// الأقسام الـ 14 الرئيسية (لوحة التحكم + 13 قسم)
const MENU_STRUCTURE: MenuItem[] = [
  // 0. لوحة التحكم
  {
    id: 'dashboard',
    labelAr: 'لوحة التحكم',
    labelEn: 'Dashboard',
    icon: LayoutDashboard,
    path: '/'
  },
  // 1. البيانات الأساسية
  {
    id: 'basic-data',
    labelAr: 'البيانات الأساسية',
    labelEn: 'Basic Data',
    icon: Database,
    subItems: [
      { path: '/basic-data/customers', labelAr: 'تعريف العملاء', labelEn: 'Customers Setup', icon: Users },
      { path: '/basic-data/suppliers', labelAr: 'تعريف الموردين', labelEn: 'Suppliers Setup', icon: Truck },
      { path: '/basic-data/branches', labelAr: 'الفروع والمخازن', labelEn: 'Branches & Warehouses', icon: Building2 },
      { path: '/basic-data/categories', labelAr: 'فئات الأصناف', labelEn: 'Categories', icon: Grid },
      { path: '/basic-data/items', labelAr: 'كارت الصنف', labelEn: 'Item Card', icon: Package },
      { path: '/basic-data/price-lists', labelAr: 'قوائم الأسعار', labelEn: 'Price Lists', icon: FileText },
      { path: '/basic-data/banks', labelAr: 'البنوك', labelEn: 'Banks', icon: Landmark },
      { path: '/basic-data/agents', labelAr: 'المندوبين', labelEn: 'Sales Agents', icon: UserCheck },
    ]
  },
  // 2. إدارة العملاء
  {
    id: 'customers',
    labelAr: 'إدارة العملاء',
    labelEn: 'Customers',
    icon: Wallet,
    subItems: [
      { path: '/customers/receipts', labelAr: 'مقبوضات العملاء', labelEn: 'Customer Receipts', icon: Receipt },
      { path: '/customers/accounts', labelAr: 'حسابات العملاء', labelEn: 'Customer Accounts', icon: FileSpreadsheet },
      { path: '/customers/pricing', labelAr: 'أسعار العملاء', labelEn: 'Customer Pricing', icon: DollarSign },
      { path: '/customers/discounts', labelAr: 'الخصم المسموح به', labelEn: 'Allowed Discounts', icon: TrendingUp },
    ]
  },
  // 3. إدارة الموردين
  {
    id: 'suppliers',
    labelAr: 'إدارة الموردين',
    labelEn: 'Suppliers',
    icon: Truck,
    subItems: [
      { path: '/suppliers/payments', labelAr: 'مدفوعات الموردين', labelEn: 'Supplier Payments', icon: CreditCard },
      { path: '/suppliers/accounts', labelAr: 'حسابات الموردين', labelEn: 'Supplier Accounts', icon: FileSpreadsheet },
      { path: '/suppliers/discounts', labelAr: 'الخصم المكتسب', labelEn: 'Earned Discounts', icon: TrendingUp },
    ]
  },
  // 4. الفواتير
  {
    id: 'invoices',
    labelAr: 'الفواتير',
    labelEn: 'Invoices',
    icon: Receipt,
    subItems: [
      { path: '/invoices/sales', labelAr: 'فواتير البيع', labelEn: 'Sales Invoices', icon: BarChart3 },
      { path: '/invoices/purchases', labelAr: 'فواتير الشراء', labelEn: 'Purchase Invoices', icon: ClipboardList },
      { path: '/invoices/sales-returns', labelAr: 'مرتجعات المبيعات', labelEn: 'Sales Returns', icon: Trash },
      { path: '/invoices/purchase-returns', labelAr: 'مرتجعات المشتريات', labelEn: 'Purchase Returns', icon: Trash },
      { path: '/invoices/reports', labelAr: 'تقارير الفواتير', labelEn: 'Invoice Reports', icon: FileText },
      { path: '/invoices/deleted', labelAr: 'الفواتير المحذوفة', labelEn: 'Deleted Invoices', icon: Trash },
    ]
  },
  // 5. المخزون
  {
    id: 'inventory',
    labelAr: 'المخزون',
    labelEn: 'Inventory',
    icon: Archive,
    subItems: [
      { path: '/inventory/balances', labelAr: 'أرصدة المخزن', labelEn: 'Stock Balances', icon: Package },
      { path: '/inventory/movement', labelAr: 'حركة المخزن', labelEn: 'Stock Movement', icon: TrendingUp },
      { path: '/inventory/orders', labelAr: 'أذونات المخزن', labelEn: 'Stock Orders', icon: ClipboardList },
      { path: '/inventory/count', labelAr: 'الجرد المخزني', labelEn: 'Stock Count', icon: Calculator },
      { path: '/inventory/shortage', labelAr: 'نواقص المخزون', labelEn: 'Stock Shortage', icon: Bell },
      { path: '/inventory/barcode', labelAr: 'طباعة الباركود', labelEn: 'Print Barcode', icon: Grid },
      { path: '/inventory/profits', labelAr: 'أرباح الأصناف', labelEn: 'Item Profits', icon: DollarSign },
    ]
  },
  // 6. التصنيع
  {
    id: 'manufacturing',
    labelAr: 'التصنيع',
    labelEn: 'Manufacturing',
    icon: Factory,
    subItems: [
      { path: '/manufacturing/bom', labelAr: 'قوائم المواد (BOM)', labelEn: 'Bill of Materials', icon: ClipboardList },
      { path: '/manufacturing/orders', labelAr: 'أوامر التصنيع', labelEn: 'Manufacturing Orders', icon: Settings },
      { path: '/manufacturing/movement', labelAr: 'حركة مخزون التصنيع', labelEn: 'Manufacturing Stock', icon: TrendingUp },
    ]
  },
  // 7. فريق المبيعات
  {
    id: 'sales-team',
    labelAr: 'فريق المبيعات',
    labelEn: 'Sales Team',
    icon: Target,
    subItems: [
      { path: '/sales-team/dashboard', labelAr: 'لوحة المتابعة', labelEn: 'Dashboard', icon: LayoutDashboard },
      { path: '/sales-team/targets', labelAr: 'أهداف المندوبين', labelEn: 'Agent Targets', icon: Target },
      { path: '/sales-team/commissions', labelAr: 'تقارير الأداء والعمولات', labelEn: 'Performance & Commissions', icon: DollarSign },
    ]
  },
  // 8. الخزينة والبنوك
  {
    id: 'treasury',
    labelAr: 'الخزينة والبنوك',
    labelEn: 'Treasury & Banks',
    icon: Landmark,
    subItems: [
      { path: '/treasury/cash', labelAr: 'إدارة النقدية', labelEn: 'Cash Management', icon: Banknote },
      { path: '/treasury/daily', labelAr: 'اليومية', labelEn: 'Daily Journal', icon: FileText },
      { path: '/treasury/monthly-profits', labelAr: 'تقارير الأرباح الشهرية', labelEn: 'Monthly Profits', icon: BarChart },
      { path: '/treasury/installments', labelAr: 'إدارة التقسيط', labelEn: 'Installments', icon: CreditCard },
      { path: '/treasury/transfers', labelAr: 'التحويلات الداخلية', labelEn: 'Internal Transfers', icon: TrendingUp },
      { path: '/treasury/bank-statements', labelAr: 'كشوف حساب البنوك', labelEn: 'Bank Statements', icon: FileSpreadsheet },
      { path: '/treasury/reconciliation', labelAr: 'التسويات البنكية', labelEn: 'Bank Reconciliation', icon: Calculator },
      { path: '/treasury/checks', labelAr: 'إدارة الشيكات', labelEn: 'Check Management', icon: CreditCard },
    ]
  },
  // 9. الحسابات العامة
  {
    id: 'accounting',
    labelAr: 'الحسابات العامة',
    labelEn: 'Accounting',
    icon: Calculator,
    subItems: [
      { path: '/accounting/chart', labelAr: 'شجرة الحسابات', labelEn: 'Chart of Accounts', icon: ClipboardList },
      { path: '/accounting/journal', labelAr: 'قيود اليومية', labelEn: 'Journal Entries', icon: FileText },
      { path: '/accounting/ledger', labelAr: 'الأستاذ العام', labelEn: 'General Ledger', icon: BookOpen },
      { path: '/accounting/cost-centers', labelAr: 'مراكز التكلفة', labelEn: 'Cost Centers', icon: Target },
      { path: '/accounting/fixed-assets', labelAr: 'الأصول الثابتة', labelEn: 'Fixed Assets', icon: Building2 },
      { path: '/accounting/trial-balance', labelAr: 'ميزان المراجعة', labelEn: 'Trial Balance', icon: BarChart },
      { path: '/accounting/balance-sheet', labelAr: 'الميزانية العمومية', labelEn: 'Balance Sheet', icon: FileSpreadsheet },
      { path: '/accounting/income-statement', labelAr: 'قائمة الدخل', labelEn: 'Income Statement', icon: TrendingUp },
    ]
  },
  // 10. الموارد البشرية
  {
    id: 'hr',
    labelAr: 'الموارد البشرية',
    labelEn: 'Human Resources',
    icon: Users,
    subItems: [
      { path: '/hr/employees', labelAr: 'إدارة الموظفين', labelEn: 'Employees', icon: UserCog },
      { path: '/hr/attendance', labelAr: 'الحضور والانصراف', labelEn: 'Attendance', icon: Clock },
      { path: '/hr/payroll', labelAr: 'مسير الرواتب', labelEn: 'Payroll', icon: DollarSign },
      { path: '/hr/loans', labelAr: 'السلف والقروض', labelEn: 'Loans & Advances', icon: CreditCard },
    ]
  },
  // 11. المبيعات المتنقلة
  {
    id: 'mobile-sales',
    labelAr: 'المبيعات المتنقلة',
    labelEn: 'Mobile Sales',
    icon: Car,
    subItems: [
      { path: '/mobile-sales/vehicles', labelAr: 'السيارات', labelEn: 'Vehicles', icon: Car },
      { path: '/mobile-sales/inventory', labelAr: 'جرد السيارات', labelEn: 'Vehicle Inventory', icon: Package },
      { path: '/mobile-sales/operations', labelAr: 'العمليات والزيارات', labelEn: 'Operations & Visits', icon: ClipboardList },
      { path: '/mobile-sales/routes', labelAr: 'خط السير', labelEn: 'Routes', icon: Route },
      { path: '/mobile-sales/settlements', labelAr: 'التسويات والتقارير', labelEn: 'Settlements & Reports', icon: FileSpreadsheet },
    ]
  },
  // 12. نقطة البيع
  {
    id: 'pos',
    labelAr: 'نقطة البيع',
    labelEn: 'Point of Sale',
    icon: ShoppingCart,
    subItems: [
      { path: '/pos', labelAr: 'شاشة البيع', labelEn: 'Sales Screen', icon: ShoppingCart },
      { path: '/pos/kitchen', labelAr: 'شاشة المطبخ (KDS)', labelEn: 'Kitchen Display', icon: ChefHat },
      { path: '/pos/tables', labelAr: 'إدارة الطاولات', labelEn: 'Table Management', icon: LayoutGrid },
      { path: '/pos/shifts', labelAr: 'الورديات', labelEn: 'Shifts', icon: History },
      { path: '/pos/reports', labelAr: 'تقارير نقطة البيع', labelEn: 'POS Reports', icon: BarChart },
    ]
  },
  // 13. الإعدادات
  {
    id: 'settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: Settings,
    subItems: [
      { path: '/settings/users', labelAr: 'إدارة المستخدمين', labelEn: 'User Management', icon: Shield },
      { path: '/settings/system', labelAr: 'إعدادات النظام', labelEn: 'System Settings', icon: Settings },
      { path: '/settings/import', labelAr: 'استيراد البيانات', labelEn: 'Import Data', icon: Database },
      { path: '/settings/audit', labelAr: 'سجل المراقبة', labelEn: 'Audit Log', icon: FileText },
      { path: '/settings/backup', labelAr: 'النسخ الاحتياطي', labelEn: 'Backup', icon: HardDrive },
    ]
  },
];

// Command Menu Component
const CommandMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // جمع كل المسارات من الهيكل
  const allRoutes = useMemo(() => {
    const routes: { label: string; en: string; path: string; icon: any }[] = [];
    MENU_STRUCTURE.forEach(menu => {
      if (menu.subItems) {
        menu.subItems.forEach(sub => {
          routes.push({
            label: sub.labelAr,
            en: sub.labelEn,
            path: sub.path,
            icon: sub.icon
          });
        });
      } else if (menu.path) {
        routes.push({
          label: menu.labelAr,
          en: menu.labelEn,
          path: menu.path,
          icon: menu.icon
        });
      }
    });
    return routes;
  }, []);

  const filtered = allRoutes.filter(r =>
    r.label.includes(search) || r.en.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface w-full max-w-xl rounded-[32px] border border-cardAccent shadow-2xl relative z-10 overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300">
        <div className="p-6 border-b border-cardAccent flex items-center gap-4 bg-background/20">
          <Search className="text-secondary" size={20} />
          <input
            ref={inputRef}
            className="bg-transparent border-none outline-none text-textPrimary w-full font-bold text-lg placeholder:text-secondary/30"
            placeholder={language === 'ar' ? 'ابحث عن وظيفة...' : 'Search function...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filtered.length > 0) {
                navigate(filtered[0].path);
                onClose();
              }
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="px-2 py-1 bg-cardAccent rounded-lg text-[10px] text-secondary font-black border border-cardAccent uppercase">Esc</div>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filtered.slice(0, 10).map((r) => (
            <button
              key={r.path}
              onClick={() => { navigate(r.path); onClose(); }}
              className="w-full flex items-center justify-between p-4 hover:bg-background rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-background rounded-xl text-secondary group-hover:text-primary transition-colors border border-cardAccent">
                  <r.icon size={20} />
                </div>
                <span className="font-black text-textPrimary">{language === 'ar' ? r.label : r.en}</span>
              </div>
              <ChevronLeft size={16} className="text-secondary opacity-0 group-hover:opacity-100 transition-all rotate-180" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// مكون القائمة الفرعية المنسدلة
const CollapsibleMenuItem = ({
  menu,
  isCollapsed,
  language,
  onNavigate,
  expandedMenus,
  toggleMenu
}: {
  menu: MenuItem;
  isCollapsed: boolean;
  language: string;
  onNavigate: () => void;
  expandedMenus: string[];
  toggleMenu: (id: string) => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isExpanded = expandedMenus.includes(menu.id);

  // تحقق من أن المسار الحالي ينتمي لهذا القسم
  const isActive = menu.subItems?.some(sub => location.pathname.startsWith(sub.path)) ||
    (menu.path && location.pathname === menu.path);

  const handleClick = () => {
    if (menu.subItems && menu.subItems.length > 0) {
      if (!isCollapsed) {
        toggleMenu(menu.id);
      } else {
        // عند النقر في الوضع المطوي، انتقل إلى أول صفحة فرعية
        navigate(menu.subItems[0].path);
        onNavigate();
      }
    } else if (menu.path) {
      navigate(menu.path);
      onNavigate();
    }
  };

  return (
    <div className="mx-3 mb-1">
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative
          ${isActive ? 'bg-primary/10 text-primary glow-primary' : 'text-secondary hover:text-textPrimary hover:bg-cardAccent'}
          ${isCollapsed ? 'justify-center px-0' : ''}`}
        title={isCollapsed ? (language === 'ar' ? menu.labelAr : menu.labelEn) : ''}
      >
        <menu.icon size={20} className="transition-transform group-hover:scale-110 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="font-bold text-sm whitespace-nowrap flex-1 text-right">
              {language === 'ar' ? menu.labelAr : menu.labelEn}
            </span>
            {menu.subItems && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </>
        )}
        {isActive && !isCollapsed && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full sidebar-active-indicator" />
        )}
      </button>

      {/* القائمة الفرعية */}
      {!isCollapsed && menu.subItems && isExpanded && (
        <div className="mt-1 mr-4 pr-4 border-r-2 border-cardAccent space-y-1">
          {menu.subItems.map((sub) => {
            const isSubActive = location.pathname === sub.path;
            return (
              <NavLink
                key={sub.path}
                to={sub.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                  ${isSubActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-secondary hover:text-textPrimary hover:bg-cardAccent/50'}`}
              >
                <sub.icon size={16} className="shrink-0" />
                <span className="whitespace-nowrap">{language === 'ar' ? sub.labelAr : sub.labelEn}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Layout: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { settings } = useData();
  const { logout, user, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // فتح القائمة الحالية تلقائياً
    const currentMenu = MENU_STRUCTURE.find(menu =>
      menu.subItems?.some(sub => location.pathname.startsWith(sub.path))
    );
    return currentMenu ? [currentMenu.id] : [];
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // فتح القائمة عند تغيير المسار
  useEffect(() => {
    const currentMenu = MENU_STRUCTURE.find(menu =>
      menu.subItems?.some(sub => location.pathname.startsWith(sub.path))
    );
    if (currentMenu && !expandedMenus.includes(currentMenu.id)) {
      setExpandedMenus(prev => [...prev, currentMenu.id]);
    }
  }, [location.pathname]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const getPageTitle = () => {
    // البحث في الهيكل للحصول على العنوان الصحيح
    for (const menu of MENU_STRUCTURE) {
      if (menu.subItems) {
        const sub = menu.subItems.find(s => location.pathname.startsWith(s.path));
        if (sub) return language === 'ar' ? sub.labelAr : sub.labelEn;
      }
      if (menu.path && location.pathname === menu.path) {
        return language === 'ar' ? menu.labelAr : menu.labelEn;
      }
    }
    return language === 'ar' ? 'لوحة التحكم' : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-background text-textPrimary font-cairo overflow-hidden relative">
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside
        className={`fixed inset-y-0 right-0 z-50 bg-surface border-l border-cardAccent flex flex-col shadow-2xl transition-all duration-300 md:static md:translate-x-0 
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
          ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Header */}
        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg glow-primary shrink-0">
              {language === 'ar' ? 'م' : 'S'}
            </div>
            {!isCollapsed && (
              <h1 className="font-black text-lg text-textPrimary leading-tight truncate max-w-[140px]">
                {language === 'ar' ? settings.restaurantNameAr : settings.restaurantNameEn}
              </h1>
            )}
          </div>
          {!isCollapsed && (
            <button className="md:hidden text-secondary" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          {MENU_STRUCTURE.map((menu) => (
            <CollapsibleMenuItem
              key={menu.id}
              menu={menu}
              isCollapsed={isCollapsed}
              language={language}
              onNavigate={() => setIsSidebarOpen(false)}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
            />
          ))}
        </nav>

        {/* Logout Button */}
        <div className={`p-4 bg-background/30 mt-auto ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={logout}
            className={`flex items-center justify-center gap-3 px-4 py-3 w-full bg-surface text-red-500 hover:bg-red-500/10 rounded-2xl transition-all text-sm font-black border border-cardAccent ${isCollapsed ? 'px-0 w-12 h-12' : ''}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-surface z-30 shrink-0 border-b border-cardAccent">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 text-textPrimary bg-background rounded-xl border border-cardAccent" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon size={24} />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 text-secondary bg-background rounded-xl border border-cardAccent hover:text-primary transition-colors"
            >
              {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-black text-textPrimary truncate max-w-[200px] md:max-w-none">{getPageTitle()}</h2>
              <button
                onClick={() => setIsCommandOpen(true)}
                className="hidden lg:flex items-center gap-3 px-4 py-2 bg-background border border-cardAccent rounded-2xl text-secondary hover:text-textPrimary transition-all group"
              >
                <Search size={14} className="group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {language === 'ar' ? 'بحث (Ctrl+K)' : 'Search (Ctrl+K)'}
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-cardAccent text-[10px] font-black text-primary">
              <ShieldCheck size={14} />
              {userRole === 'admin' ? (language === 'ar' ? 'مدير النظام' : 'Admin') :
                userRole === 'manager' ? (language === 'ar' ? 'مدير' : 'Manager') :
                  userRole === 'accountant' ? (language === 'ar' ? 'محاسب' : 'Accountant') :
                    userRole === 'cashier' ? (language === 'ar' ? 'كاشير' : 'Cashier') :
                      userRole === 'chef' ? (language === 'ar' ? 'شيف' : 'Chef') :
                        userRole}
            </div>

            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="p-2 md:p-3 rounded-2xl bg-background text-secondary hover:text-primary transition-colors border border-cardAccent">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="p-2 md:p-3 rounded-2xl bg-background text-secondary hover:text-primary transition-colors border border-cardAccent">
              <span className="text-[10px] md:text-xs font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* User Info Card */}
            <div className="flex items-center gap-3 bg-background px-2 md:px-4 py-1.5 md:py-2 rounded-2xl border border-cardAccent">
              <div className="text-left rtl:text-right hidden sm:block">
                <p className="text-xs font-black text-textPrimary">{user || 'Admin'}</p>
                <p className="text-[10px] text-secondary font-bold">
                  {userRole === 'admin' ? (language === 'ar' ? 'مدير النظام' : 'System Admin') :
                    userRole === 'manager' ? (language === 'ar' ? 'مدير' : 'Manager') :
                      userRole === 'accountant' ? (language === 'ar' ? 'محاسب' : 'Accountant') :
                        userRole === 'cashier' ? (language === 'ar' ? 'كاشير' : 'Cashier') :
                          userRole === 'chef' ? (language === 'ar' ? 'شيف' : 'Chef') :
                            userRole || (language === 'ar' ? 'موظف' : 'Employee')}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">{user ? user.charAt(0) : 'A'}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
