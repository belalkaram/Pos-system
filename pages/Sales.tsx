
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, Printer, FileDown, Eye, XCircle, Search,
    Filter, RotateCcw, ChevronDown, ChevronUp, CreditCard,
    Banknote, Utensils, Bike, ShoppingBag, CheckCircle2, X, User, FileText
} from 'lucide-react';
import { Order } from '../types';
import { ReceiptTemplate } from '../components/ReceiptTemplate';
import { Input, Button } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';
import * as XLSX from 'xlsx';
import { printTaxInvoiceA4, printThermalReceipt } from '../utils/printService';
import { generateZatcaBase64 } from '../utils/zatca';

const Sales: React.FC = () => {
    const { orders, settings } = useData();
    const { t, language } = useLanguage();
    const { userRole } = useAuth();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // Filter States
    const [showFilters, setShowFilters] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [paymentFilter, setPaymentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [printOrder, setPrintOrder] = useState<Order | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Advanced Filtering Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || order.type === typeFilter;
            const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            const orderDate = order.createdAt.split('T')[0];
            const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
            const matchesDateTo = !dateTo || orderDate <= dateTo;

            return matchesSearch && matchesType && matchesPayment && matchesStatus && matchesDateFrom && matchesDateTo;
        });
    }, [orders, searchQuery, typeFilter, paymentFilter, statusFilter, dateFrom, dateTo]);

    // Dynamic Statistics based on filtered results
    const totalGross = filteredOrders.reduce((acc, o) => acc + o.total, 0);
    const totalTax = filteredOrders.reduce((acc, o) => acc + o.tax, 0);
    const totalNet = totalGross - totalTax;

    const handlePrintAction = (order: Order, type: 'a4' | 'thermal' = 'thermal') => {
        const qrValue = generateZatcaBase64(
            settings.restaurantNameAr,
            settings.taxId,
            order.createdAt,
            order.total.toString(),
            order.tax.toString()
        );

        if (type === 'a4') {
            printTaxInvoiceA4({ order, settings, currency, language, qrValue });
        } else {
            printThermalReceipt({ order, settings, currency, language, qrValue });
        }
    };

    const handleViewAction = (order: Order) => {
        setPrintOrder(order);
        setIsPreviewMode(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
        setTypeFilter('all');
        setPaymentFilter('all');
        setStatusFilter('all');
    };

    // Excel Export Function
    const handleExportExcel = () => {
        const exportData = filteredOrders.map(order => ({
            'رقم الطلب': order.id,
            'التاريخ': new Date(order.createdAt).toLocaleDateString('ar-EG'),
            'الوقت': new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            'نوع الخدمة': order.type === 'dine-in' ? 'داخل المطعم' : order.type === 'takeaway' ? 'تيك أواي' : 'توصيل',
            'طريقة الدفع': order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod === 'card' ? 'بطاقة' : 'آجل',
            'الحالة': order.status === 'completed' ? 'مكتمل' : order.status === 'cancelled' ? 'ملغي' : 'معلق',
            'المجموع الفرعي': order.subtotal,
            'الضريبة': order.tax,
            'رسوم الخدمة': order.serviceCharge || 0,
            'الإجمالي': order.total,
            'المسؤول': order.performedBy?.name || 'غير محدد',
            'عدد الأصناف': order.items.length,
            'الأصناف': order.items.map(i => `${i.nameAr || i.nameEn} x${i.quantity}`).join(' | ')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, // رقم الطلب
            { wch: 12 }, // التاريخ
            { wch: 10 }, // الوقت
            { wch: 15 }, // نوع الخدمة
            { wch: 12 }, // طريقة الدفع
            { wch: 10 }, // الحالة
            { wch: 12 }, // المجموع الفرعي
            { wch: 10 }, // الضريبة
            { wch: 12 }, // رسوم الخدمة
            { wch: 12 }, // الإجمالي
            { wch: 15 }, // المسؤول
            { wch: 12 }, // عدد الأصناف
            { wch: 50 }, // الأصناف
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'المبيعات');

        // Add summary sheet
        const summaryData = [
            { 'البيان': 'إجمالي المبيعات', 'القيمة': totalGross },
            { 'البيان': 'إجمالي الضريبة', 'القيمة': totalTax },
            { 'البيان': 'صافي المبيعات', 'القيمة': totalNet },
            { 'البيان': 'عدد الطلبات', 'القيمة': filteredOrders.length },
            { 'البيان': 'تاريخ التصدير', 'القيمة': new Date().toLocaleString('ar-EG') }
        ];
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        summaryWs['!cols'] = [{ wch: 20 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'ملخص');

        const timestamp = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `sales_report_${timestamp}.xlsx`);
    };

    return (
        <div className="space-y-6 pb-12 font-cairo">
            {/* Header Area */}
            <div className="flex justify-between items-center no-print">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{t('salesHistory')}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">تتبع وتحليل العمليات بدقة متناهية</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-black text-sm ${showFilters ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-cardAccent text-secondary hover:text-textPrimary'}`}
                    >
                        <Filter size={18} /> {showFilters ? 'إخفاء الفلاتر' : 'تفعيل الفلترة'}
                    </button>
                    {userRole !== 'cashier' && (
                        <button onClick={handleExportExcel} className="flex items-center gap-2 bg-surface text-secondary border border-cardAccent px-6 py-3 rounded-2xl hover:text-textPrimary hover:bg-accentGreen/10 hover:border-accentGreen/30 transition-all font-black text-sm">
                            <FileDown size={18} className="text-accentGreen" /> {t('export')}
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filter Panel */}
            {showFilters && (
                <div className="bg-surface p-6 rounded-[32px] border border-cardAccent shadow-2xl space-y-6 no-print animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">رقم الطلب / المرجع</label>
                            <div className="relative group">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={16} />
                                <Input
                                    className="pr-12 h-12"
                                    placeholder="بحث رقمي سريع..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">من تاريخ</label>
                            <Input
                                type="date"
                                className="h-12"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">إلى تاريخ</label>
                            <Input
                                type="date"
                                className="h-12"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        {/* Reset */}
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={resetFilters}
                                className="h-12 gap-2 border-dashed border-cardAccent hover:border-red-500/50 hover:text-red-500"
                            >
                                <RotateCcw size={16} /> إعادة تعيين الفلترة
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-cardAccent">
                        {/* Type Toggle */}
                        <div className="flex bg-background p-1 rounded-xl border border-cardAccent">
                            {['all', 'dine-in', 'takeaway', 'delivery'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${typeFilter === type ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-textPrimary'}`}
                                >
                                    {type === 'all' ? 'كل الأنواع' : t(type as any)}
                                </button>
                            ))}
                        </div>

                        {/* Payment Toggle */}
                        <div className="flex bg-background p-1 rounded-xl border border-cardAccent">
                            {['all', 'cash', 'card', 'credit'].map(pm => (
                                <button
                                    key={pm}
                                    onClick={() => setPaymentFilter(pm)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${paymentFilter === pm ? 'bg-accentBlue text-white shadow-lg' : 'text-secondary hover:text-textPrimary'}`}
                                >
                                    {pm === 'all' ? 'كل الدفع' : t(pm as any)}
                                </button>
                            ))}
                        </div>

                        {/* Status Toggle */}
                        <div className="flex bg-background p-1 rounded-xl border border-cardAccent">
                            {['all', 'completed', 'cancelled', 'pending'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${statusFilter === st ? 'bg-accentGreen text-white shadow-lg' : 'text-secondary hover:text-textPrimary'}`}
                                >
                                    {st === 'all' ? 'كل الحالات' : st === 'completed' ? 'مكتمل' : st === 'cancelled' ? 'ملغي' : 'معلق'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Statistics Cards */}
            {userRole !== 'cashier' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                    <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group">
                        <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">إجمالي مبيعات الفلترة</p>
                        <h3 className="text-3xl font-black text-accentGreen group-hover:scale-105 transition-transform duration-500">{totalGross.toLocaleString()} <span className="text-sm opacity-50 font-bold">{currency}</span></h3>
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-accentGreen/10 rounded-full blur-2xl group-hover:bg-accentGreen/20 transition-all" />
                    </div>
                    <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group">
                        <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">ضريبة القيمة المضافة</p>
                        <h3 className="text-3xl font-black text-red-500 group-hover:scale-105 transition-transform duration-500">{totalTax.toLocaleString()} <span className="text-sm opacity-50 font-bold">{currency}</span></h3>
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                    </div>
                    <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group">
                        <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">صافي الربح المفلتر</p>
                        <h3 className="text-3xl font-black text-primary group-hover:scale-105 transition-transform duration-500">{totalNet.toLocaleString()} <span className="text-sm opacity-50 font-bold">{currency}</span></h3>
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden shadow-2xl no-print relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-cardAccent">
                            <tr>
                                <th className="px-8 py-6 font-black tracking-widest">رقم الطلب</th>
                                <th className="px-8 py-6 font-black tracking-widest text-center">المسؤول</th>
                                <th className="px-8 py-6 font-black tracking-widest">التفاصيل</th>
                                <th className="px-8 py-6 font-black tracking-widest text-center">نوع الخدمة</th>
                                <th className="px-8 py-6 font-black tracking-widest text-left">{t('total')}</th>
                                <th className="px-8 py-6 font-black tracking-widest text-left">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cardAccent">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-32">
                                        <div className="flex flex-col items-center opacity-30">
                                            <ShoppingBag size={64} className="mb-4" />
                                            <p className="font-black text-lg italic text-textPrimary">لا توجد مبيعات مطابقة لهذه الفلاتر</p>
                                            <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>عرض كل المبيعات</Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-background/40 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-black text-sm w-fit">#{order.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-background/50 rounded-xl border border-cardAccent">
                                                <User size={12} className="text-primary" />
                                                <div className="text-[10px] text-textPrimary">
                                                    <p className="font-black">{order.performedBy?.name || 'Unknown'}</p>
                                                    <p className="text-secondary opacity-70 uppercase tracking-tighter">({order.performedBy?.role || 'Guest'})</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-secondary border border-cardAccent group-hover:border-primary/30 transition-all"><Calendar size={18} /></div>
                                                <div>
                                                    <p className="font-black text-textPrimary">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-secondary font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-xl border border-cardAccent">
                                                {order.type === 'dine-in' ? <Utensils size={12} className="text-accentBlue" /> : order.type === 'takeaway' ? <ShoppingBag size={12} className="text-primary" /> : <Bike size={12} className="text-accentGreen" />}
                                                <span className="text-[10px] font-black text-textPrimary">{t(order.type)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            <span className="text-lg font-black text-textPrimary">{order.total.toLocaleString()} <span className="text-xs opacity-40">{currency}</span></span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleViewAction(order)} className="p-3 bg-background border border-cardAccent text-secondary hover:text-textPrimary rounded-xl transition-all shadow-sm" title="معاينة"><Eye size={18} /></button>
                                                <button onClick={() => handlePrintAction(order)} className="p-3 bg-background border border-cardAccent text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm" title="طباعة"><Printer size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice View Modal */}
            {isPreviewMode && printOrder && (
                <Modal isOpen={isPreviewMode} onClose={() => setIsPreviewMode(false)}>
                    <Modal.Header title="معاينة الفاتورة الضريبية" subtitle={`رقم الطلب: #${printOrder.id}`} />
                    <Modal.Body className="bg-gray-100">
                        <div className="bg-white shadow-inner p-4 rounded-xl overflow-hidden">
                            <ReceiptTemplate
                                order={printOrder}
                                settings={settings}
                                currency={currency}
                                language={language}
                                t={t}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="grid grid-cols-3 gap-3">
                            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>{t('cancel')}</Button>
                            <Button
                                variant="outline"
                                onClick={() => { handlePrintAction(printOrder, 'a4'); setIsPreviewMode(false); }}
                                className="gap-2 border-accentBlue text-accentBlue hover:bg-accentBlue hover:text-white"
                            >
                                <FileText size={16} /> A4
                            </Button>
                            <Button onClick={() => { handlePrintAction(printOrder, 'thermal'); setIsPreviewMode(false); }} className="gap-2">
                                <Printer size={16} /> حراري
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Hidden Print Container */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                {printOrder && (
                    <ReceiptTemplate
                        order={printOrder}
                        settings={settings}
                        currency={currency}
                        language={language}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

export default Sales;
