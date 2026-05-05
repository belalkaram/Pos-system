
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/ui/ToastContainer';
import Layout from './components/Layout';
import { UserRole } from './types';

// صفحة الدخول
import Login from './pages/Login';

// Dashboard
import Dashboard from './pages/Dashboard';
import Presentation from './pages/Presentation';

// ============================================
// 1. البيانات الأساسية (Basic Data)
// ============================================
import CustomersSetup from './pages/BasicData/CustomersSetup';
import SuppliersSetup from './pages/BasicData/SuppliersSetup';
import BranchesWarehouses from './pages/BasicData/BranchesWarehouses';
import Categories from './pages/Categories'; // موجود مسبقاً
import Menu from './pages/Menu'; // كارت الصنف - موجود مسبقاً
import PriceLists from './pages/BasicData/PriceLists';
import Banks from './pages/BasicData/Banks';
import Agents from './pages/BasicData/Agents';

// ============================================
// 2. إدارة العملاء (Customer Management)
// ============================================
import CustomerReceipts from './pages/CustomerManagement/Receipts';
import CustomerAccounts from './pages/CustomerManagement/Accounts';
import CustomerPricing from './pages/CustomerManagement/Pricing';
import AllowedDiscounts from './pages/CustomerManagement/Discounts';

// ============================================
// 3. إدارة الموردين (Supplier Management)
// ============================================
import SupplierPayments from './pages/SupplierManagement/Payments';
import SupplierAccountsNew from './pages/SupplierManagement/Accounts';
import EarnedDiscounts from './pages/SupplierManagement/Discounts';

// ============================================
// 4. الفواتير (Invoices)
// ============================================
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import SalesReturns from './pages/Invoices/SalesReturns';
import PurchaseReturns from './pages/Invoices/PurchaseReturns';
import InvoiceReports from './pages/Invoices/InvoiceReports';
import DeletedInvoices from './pages/Invoices/DeletedInvoices';

// ============================================
// 5. المخزون (Inventory)
// ============================================
import Inventory from './pages/Inventory';
import Warehouses from './pages/Warehouses';
import StockMovement from './pages/Inventory/StockMovement';
import StockOrders from './pages/Inventory/StockOrders';
import StockCount from './pages/Inventory/StockCount';
import StockShortage from './pages/Inventory/StockShortage';
import PrintBarcode from './pages/Inventory/PrintBarcode';
import ItemProfits from './pages/Inventory/ItemProfits';

// ============================================
// 6. التصنيع (Manufacturing)
// ============================================
import BOM from './pages/Manufacturing/BOM';
import ManufacturingOrders from './pages/Manufacturing/Orders';
import ManufacturingMovement from './pages/Manufacturing/Movement';

// ============================================
// 7. فريق المبيعات (Sales Team)
// ============================================
import SalesTeamDashboard from './pages/SalesTeam/Dashboard';
import AgentTargets from './pages/SalesTeam/Targets';
import Commissions from './pages/SalesTeam/Commissions';

// ============================================
// 8. الخزينة والبنوك (Treasury & Banks)
// ============================================
import Treasury from './pages/Treasury';
import CashManagement from './pages/TreasuryBanks/CashManagement';
import DailyJournal from './pages/TreasuryBanks/DailyJournal';
import MonthlyProfits from './pages/TreasuryBanks/MonthlyProfits';
import Installments from './pages/TreasuryBanks/Installments';
import Transfers from './pages/TreasuryBanks/Transfers';
import BankStatements from './pages/TreasuryBanks/BankStatements';
import BankReconciliation from './pages/TreasuryBanks/Reconciliation';
import CheckManagement from './pages/TreasuryBanks/Checks';

// ============================================
// 9. الحسابات العامة (Accounting)
// ============================================
import ChartOfAccounts from './pages/Accounting/ChartOfAccounts';
import JournalEntries from './pages/Accounting/JournalEntries';
import GeneralLedger from './pages/Accounting/GeneralLedger';
import CostCenters from './pages/Accounting/CostCenters';
import FixedAssets from './pages/Accounting/FixedAssets';
import FinancialReports from './pages/Accounting/FinancialReports';
import TrialBalance from './pages/Accounting/TrialBalance';
import BalanceSheet from './pages/Accounting/BalanceSheet';
import IncomeStatement from './pages/Accounting/IncomeStatement';

// ============================================
// 10. الموارد البشرية (Human Resources)
// ============================================
import Employees from './pages/Employees'; // موجود
import Attendance from './pages/HumanResources/Attendance';
import Payroll from './pages/HumanResources/Payroll';
import Loans from './pages/HumanResources/Loans';

// ============================================
// 11. المبيعات المتنقلة (Mobile Sales)
// ============================================
import Vehicles from './pages/MobileSales/Vehicles';
import VehicleInventory from './pages/MobileSales/Inventory';
import Operations from './pages/MobileSales/Operations';
import MobileRoutes from './pages/MobileSales/Routes';
import Settlements from './pages/MobileSales/Settlements';

// ============================================
// 12. نقطة البيع (POS)
// ============================================
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import Tables from './pages/Tables';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';

// ============================================
// 13. الإعدادات (Settings)
// ============================================
import Settings from './pages/Settings';
import UserManagement from './pages/Settings/UserManagement';
import SystemSettings from './pages/Settings/SystemSettings';
import ImportData from './pages/Settings/ImportData';
import AuditLog from './pages/Settings/AuditLog';
import Backup from './pages/Settings/Backup';

// ============================================
// Super Admin
// ============================================
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import TenantManagement from './pages/admin/TenantManagement';
import BranchManagement from './pages/admin/BranchManagement';
import Subscriptions from './pages/admin/Subscriptions';
import GlobalSettingsPage from './pages/admin/GlobalSettings';
import AuditLogs from './pages/admin/AuditLogs';
import AdminUsers from './pages/admin/AdminUsers';
import NotificationCenter from './pages/admin/NotificationCenter';
import MaintenancePage from './pages/admin/MaintenancePage';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    if (userRole === 'cashier') return <Navigate to="/pos" replace />;
    if (userRole === 'manager') return <Navigate to="/inventory/balances" replace />;
    if (userRole === 'chef') return <Navigate to="/pos/kitchen" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <DataProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>

                    {/* Dashboard الرئيسي */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
                      <Route index element={<Dashboard />} />
                    </Route>

                    {/* صفحة العرض التقديمي */}
                    <Route path="presentation" element={<Presentation />} />

                    {/* ======================================== */}
                    {/* 1. البيانات الأساسية (Basic Data) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'manager']} />}>
                      <Route path="basic-data/customers" element={<CustomersSetup />} />
                      <Route path="basic-data/suppliers" element={<SuppliersSetup />} />
                      <Route path="basic-data/branches" element={<BranchesWarehouses />} />
                      <Route path="basic-data/categories" element={<Categories />} />
                      <Route path="basic-data/items" element={<Menu />} />
                      <Route path="basic-data/price-lists" element={<PriceLists />} />
                      <Route path="basic-data/banks" element={<Banks />} />
                      <Route path="basic-data/agents" element={<Agents />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 2. إدارة العملاء (Customer Management) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'cashier']} />}>
                      <Route path="customers/receipts" element={<CustomerReceipts />} />
                      <Route path="customers/accounts" element={<CustomerAccounts />} />
                      <Route path="customers/pricing" element={<CustomerPricing />} />
                      <Route path="customers/discounts" element={<AllowedDiscounts />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 3. إدارة الموردين (Supplier Management) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'manager']} />}>
                      <Route path="suppliers/payments" element={<SupplierPayments />} />
                      <Route path="suppliers/accounts" element={<SupplierAccountsNew />} />
                      <Route path="suppliers/discounts" element={<EarnedDiscounts />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 4. الفواتير (Invoices) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'cashier']} />}>
                      <Route path="invoices/sales" element={<Sales />} />
                      <Route path="invoices/purchases" element={<Purchases />} />
                      <Route path="invoices/sales-returns" element={<SalesReturns />} />
                      <Route path="invoices/purchase-returns" element={<PurchaseReturns />} />
                      <Route path="invoices/reports" element={<InvoiceReports />} />
                      <Route path="invoices/deleted" element={<DeletedInvoices />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 5. المخزون (Inventory) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'manager', 'chef']} />}>
                      <Route path="inventory/balances" element={<Inventory />} />
                      <Route path="inventory/movement" element={<StockMovement />} />
                      <Route path="inventory/orders" element={<StockOrders />} />
                      <Route path="inventory/count" element={<StockCount />} />
                      <Route path="inventory/shortage" element={<StockShortage />} />
                      <Route path="inventory/barcode" element={<PrintBarcode />} />
                      <Route path="inventory/profits" element={<ItemProfits />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 6. التصنيع (Manufacturing) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'chef']} />}>
                      <Route path="manufacturing/bom" element={<BOM />} />
                      <Route path="manufacturing/orders" element={<ManufacturingOrders />} />
                      <Route path="manufacturing/movement" element={<ManufacturingMovement />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 7. فريق المبيعات (Sales Team) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                      <Route path="sales-team/dashboard" element={<SalesTeamDashboard />} />
                      <Route path="sales-team/targets" element={<AgentTargets />} />
                      <Route path="sales-team/commissions" element={<Commissions />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 8. الخزينة والبنوك (Treasury & Banks) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'cashier']} />}>
                      <Route path="treasury/cash" element={<CashManagement />} />
                      <Route path="treasury/daily" element={<DailyJournal />} />
                      <Route path="treasury/monthly-profits" element={<MonthlyProfits />} />
                      <Route path="treasury/installments" element={<Installments />} />
                      <Route path="treasury/transfers" element={<Transfers />} />
                      <Route path="treasury/bank-statements" element={<BankStatements />} />
                      <Route path="treasury/reconciliation" element={<BankReconciliation />} />
                      <Route path="treasury/checks" element={<CheckManagement />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 9. الحسابات العامة (Accounting) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
                      <Route path="accounting/chart" element={<ChartOfAccounts />} />
                      <Route path="accounting/journal" element={<JournalEntries />} />
                      <Route path="accounting/ledger" element={<GeneralLedger />} />
                      <Route path="accounting/cost-centers" element={<CostCenters />} />
                      <Route path="accounting/fixed-assets" element={<FixedAssets />} />
                      <Route path="accounting/trial-balance" element={<TrialBalance />} />
                      <Route path="accounting/balance-sheet" element={<BalanceSheet />} />
                      <Route path="accounting/income-statement" element={<IncomeStatement />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 10. الموارد البشرية (Human Resources) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="hr/employees" element={<Employees />} />
                      <Route path="hr/attendance" element={<Attendance />} />
                      <Route path="hr/payroll" element={<Payroll />} />
                      <Route path="hr/loans" element={<Loans />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 11. المبيعات المتنقلة (Mobile Sales) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                      <Route path="mobile-sales/vehicles" element={<Vehicles />} />
                      <Route path="mobile-sales/inventory" element={<VehicleInventory />} />
                      <Route path="mobile-sales/operations" element={<Operations />} />
                      <Route path="mobile-sales/routes" element={<MobileRoutes />} />
                      <Route path="mobile-sales/settlements" element={<Settlements />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 12. نقطة البيع (POS) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                      <Route path="pos" element={<POS />} />
                      <Route path="pos/kitchen" element={<Kitchen />} />
                      <Route path="pos/tables" element={<Tables />} />
                      <Route path="pos/shifts" element={<Shifts />} />
                      <Route path="pos/reports" element={<Reports />} />
                    </Route>

                    {/* ======================================== */}
                    {/* 13. الإعدادات (Settings) */}
                    {/* ======================================== */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="settings/users" element={<UserManagement />} />
                      <Route path="settings/system" element={<SystemSettings />} />
                      <Route path="settings/import" element={<ImportData />} />
                      <Route path="settings/audit" element={<AuditLog />} />
                      <Route path="settings/backup" element={<Backup />} />
                    </Route>

                    {/* المسارات القديمة للتوافق */}
                    <Route path="menu" element={<Menu />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="warehouses" element={<Warehouses />} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="purchases" element={<Purchases />} />
                    <Route path="treasury" element={<Treasury />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="kitchen" element={<Kitchen />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="shifts" element={<Shifts />} />

                  </Route>
                </Route>

                {/* Super Admin Routes */}
                <Route path="/super-admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="tenants" element={<TenantManagement />} />
                  <Route path="branches" element={<BranchManagement />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="settings" element={<GlobalSettingsPage />} />
                  <Route path="audit" element={<AuditLogs />} />
                  <Route path="admins" element={<AdminUsers />} />
                  <Route path="notifications" element={<NotificationCenter />} />
                  <Route path="maintenance" element={<MaintenancePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
            <ToastContainer />
          </DataProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
