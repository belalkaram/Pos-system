
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useCartCalculation } from '../features/pos/hooks/useCartCalculation';
import { Button, Input, Badge, EmptyState } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';
import { CartItem, MenuItem, Order, ProductVariant, ProductAddon } from '../types';
import { ReceiptTemplate } from '../components/ReceiptTemplate';
import {
    Plus, Minus, CreditCard, Banknote, ShoppingBag,
    Printer, Utensils, Bike, LayoutGrid, CheckCircle2,
    Settings2, Trash2, PauseCircle, PlayCircle, MessageSquare,
    Coins, DoorOpen, Clock, ChevronRight, User, Filter, FileText
} from 'lucide-react';
import { printTaxInvoiceA4, printThermalReceipt } from '../utils/printService';
import { generateZatcaBase64 } from '../utils/zatca';

// Palette for categories
const CATEGORY_COLORS = [
    '#FF9F43', // Orange
    '#28C76F', // Green
    '#00CFDE', // Cyan
    '#EA5455', // Red
    '#7367F0', // Indigo
    '#F1C40F', // Yellow
    '#E91E63', // Pink
    '#009688', // Teal
    '#607D8B', // Blue Gray
    '#9C27B0'  // Purple
];

const POS: React.FC = () => {
    const { menuItems, addOrder, categories, settings, nextOrderNumber, tables, activeShift, openShift } = useData();
    const { t, language } = useLanguage();
    const { user, userRole } = useAuth();
    const { addToast } = useToastStore();

    const {
        cart, addToCart, removeFromCart, updateQuantity,
        clearCart, holdOrder, heldOrders, resumeOrder, updateItemNote
    } = useCartStore();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [orderType, setOrderType] = useState<Order['type']>('takeaway');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [isCompactView, setIsCompactView] = useState(settings.defaultCompactView || false);
    const [isAutoPrint, setIsAutoPrint] = useState(settings.defaultAutoPrint || false);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    const [showShiftModal, setShowShiftModal] = useState(!activeShift && userRole === 'cashier');
    const [shiftStartBalance, setShiftStartBalance] = useState<number>(0);

    const [noteModal, setNoteModal] = useState<{ show: boolean, index?: number, value: string }>({ show: false, value: '' });
    const [selectionModal, setSelectionModal] = useState<{ show: boolean, product?: MenuItem }>({ show: false });
    const [selectedVar, setSelectedVar] = useState<ProductVariant | null>(null);
    const [selectedAds, setSelectedAds] = useState<ProductAddon[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showHeldModal, setShowHeldModal] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    const { subtotal, serviceCharge, tax, total } = useCartCalculation(cart, settings, orderType);
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;
    const receivedNum = parseFloat(cashReceived) || 0;
    const changeAmount = Math.max(0, receivedNum - total);

    // Helper to get color for a category ID
    const getCategoryColor = (catId: string) => {
        if (catId === 'all') return '#FF9F43';
        const index = categories.findIndex(c => c.id === catId);
        return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeShift && userRole !== 'admin') return;
            if (e.key === 'F1') { e.preventDefault(); finalizeOrder('cash'); }
            if (e.key === 'F4') { e.preventDefault(); handleHold(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, cashReceived, activeShift, userRole]);

    useEffect(() => {
        const preSelected = localStorage.getItem('selectedTableId');
        if (preSelected) {
            setSelectedTableId(preSelected);
            setOrderType('dine-in');
            localStorage.removeItem('selectedTableId');
        }
    }, []);

    const handleOpenShift = () => {
        if (shiftStartBalance < 0) {
            addToast('رصيد البداية لا يمكن أن يكون بالسالب', 'error');
            return;
        }
        openShift(user || 'guest', user || 'المستخدم', shiftStartBalance);
        setShowShiftModal(false);
    };

    const handleProductClick = (item: MenuItem) => {
        if (!item.available) return;
        if (item.variants.length > 0 || item.addons.length > 0) {
            setSelectedVar(item.variants.length > 0 ? item.variants[0] : null);
            setSelectedAds([]);
            setSelectionModal({ show: true, product: item });
        } else {
            addToCart(item, null, []);
        }
    };

    const handleConfirmSelection = () => {
        if (selectionModal.product) {
            addToCart(selectionModal.product, selectedVar, selectedAds);
            setSelectionModal({ show: false });
        }
    };

    const handleHold = () => {
        if (cart.length === 0) return;
        holdOrder();
        addToast('تم تعليق الطلب', 'info');
    };

    const finalizeOrder = (method: 'cash' | 'card' | 'credit') => {
        if (!activeShift && userRole !== 'admin') {
            setShowShiftModal(true);
            return;
        }
        if (cart.length === 0) return;
        if (orderType === 'dine-in' && !selectedTableId) {
            addToast('يرجى اختيار الطاولة أولاً', 'error');
            return;
        }

        const order: Order = {
            id: nextOrderNumber.toString(),
            items: [...cart],
            subtotal,
            discount: 0,
            serviceCharge,
            tax,
            total,
            paymentMethod: method,
            amountReceived: method === 'cash' ? (receivedNum || total) : total,
            changeAmount: method === 'cash' ? changeAmount : 0,
            type: orderType,
            tableId: selectedTableId || undefined,
            status: 'pending',
            createdAt: new Date().toISOString(),
            performedBy: { name: user || 'Anonymous', role: userRole || 'Unknown' }
        };

        addOrder(order);
        setLastOrder(order);
        if (isAutoPrint) {
            setTimeout(() => { window.print(); resetPOS(); }, 300);
        } else {
            setShowSuccessModal(true);
        }
    };

    const resetPOS = () => {
        clearCart();
        setCashReceived('');
        setSelectedTableId(null);
        setShowSuccessModal(false);
    };

    const handlePrintOrder = (order: Order, type: 'a4' | 'thermal') => {
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
        resetPOS();
    };

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            return selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
        });
    }, [menuItems, selectedCategoryId]);

    return (
        <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-7.5rem)] gap-3 font-cairo select-none relative">

            {/* Overlay if shift is closed */}
            {!activeShift && userRole === 'cashier' && (
                <div className="absolute inset-0 z-[45] bg-background/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-surface p-10 rounded-[32px] border border-primary/20 shadow-2xl text-center max-w-md animate-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                            <DoorOpen size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-textPrimary mb-2 text-center">الوردية مغلقة</h3>
                        <p className="text-secondary font-bold mb-6 text-sm text-center">يجب فتح وردية جديدة للبدء</p>
                        <Button fullWidth size="md" onClick={() => setShowShiftModal(true)}>بدء الوردية</Button>
                    </div>
                </div>
            )}

            {/* Main Grid: Categories & Menu Items */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden no-print">

                {/* Categories Section (Flex Wrap) */}
                <div className="bg-surface p-4 rounded-[28px] border border-cardAccent shadow-sm">
                    <div className="flex items-center gap-3 mb-4 border-b border-cardAccent pb-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <Filter size={18} />
                        </div>
                        <h3 className="font-black text-textPrimary text-sm">الأقسام:</h3>
                        <div className="flex-1" />
                        <button
                            onClick={() => setIsCompactView(!isCompactView)}
                            className={`p-2 rounded-xl border transition-all ${isCompactView ? 'bg-primary text-background border-primary shadow-lg' : 'bg-background border-cardAccent text-secondary'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    {/* Colored Categories Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategoryId('all')}
                            style={{
                                backgroundColor: selectedCategoryId === 'all' ? getCategoryColor('all') : 'transparent',
                                borderColor: selectedCategoryId === 'all' ? getCategoryColor('all') : 'var(--color-card-accent)',
                                color: selectedCategoryId === 'all' ? '#FFF' : 'var(--color-secondary)'
                            }}
                            className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all border shadow-sm ${selectedCategoryId === 'all' ? 'shadow-md scale-105 z-10' : 'hover:border-primary/40'}`}
                        >
                            {t('all')}
                        </button>
                        {categories.map(cat => {
                            const color = getCategoryColor(cat.id);
                            const isActive = selectedCategoryId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    style={{
                                        backgroundColor: isActive ? color : 'transparent',
                                        borderColor: isActive ? color : 'var(--color-card-accent)',
                                        color: isActive ? '#FFF' : 'var(--color-secondary)'
                                    }}
                                    className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all border shadow-sm ${isActive ? 'shadow-md scale-105 z-10' : 'hover:border-primary/40'}`}
                                >
                                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Grid Container (Responsive Products) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                    {filteredItems.length === 0 ? (
                        <EmptyState icon={ShoppingBag} title="لا توجد أصناف" description="يرجى إضافة أصناف للمنيو أولاً" />
                    ) : (
                        <div className={`grid gap-2.5 ${isCompactView ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                            {filteredItems.map(item => {
                                const count = cart.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
                                const color = getCategoryColor(item.categoryId);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleProductClick(item)}
                                        style={{ borderTop: `4px solid ${color}` }}
                                        className={`bg-surface rounded-[22px] border border-cardAccent p-3 transition-all relative group shadow-sm hover:shadow-md hover:-translate-y-0.5 ${item.available ? 'cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}
                                    >
                                        {count > 0 && <div style={{ backgroundColor: color }} className="absolute -top-3 -left-1.5 w-7 h-7 text-white rounded-full flex items-center justify-center font-black text-[10px] z-20 shadow-lg glow-primary animate-in zoom-in">{count}</div>}
                                        <div className="flex flex-col h-full justify-between">
                                            <div className="space-y-1">
                                                <h3 className={`font-black text-textPrimary leading-tight group-hover:text-primary transition-colors ${isCompactView ? 'text-[10px] line-clamp-1' : 'text-[12px] line-clamp-2'}`}>{language === 'ar' ? item.nameAr : item.nameEn}</h3>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <p style={{ color: color }} className="font-black text-[14px]">{item.basePrice}<span className="text-[9px] text-secondary ml-0.5 font-bold">{currency}</span></p>
                                                <div style={{ backgroundColor: `${color}15`, color: color }} className="p-1 rounded-lg transition-all group-hover:bg-primary group-hover:text-background"><Plus size={12} /></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Sidebar Cart (Compact 300px) */}
            <div className="w-full lg:w-[300px] bg-surface border-l border-cardAccent flex flex-col no-print shadow-2xl overflow-hidden shrink-0 rounded-t-[32px] lg:rounded-none">

                {/* Cart Header */}
                <div className="p-3 border-b border-cardAccent flex items-center justify-between bg-background/20">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black shadow-inner border border-primary/10 text-[10px]">
                            #{nextOrderNumber}
                        </div>
                        <div>
                            <h3 className="font-black text-textPrimary text-[11px]">فاتورة جديدة</h3>
                            <p className="text-[8px] text-secondary font-bold flex items-center gap-1"><Clock size={8} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowHeldModal(true)} className="p-1.5 bg-background border border-cardAccent rounded-lg text-secondary hover:text-primary relative group">
                        <PauseCircle size={16} />
                        {heldOrders.length > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[7px] flex items-center justify-center font-black">{heldOrders.length}</span>}
                    </button>
                </div>

                {/* Order Type Selector (Tiny Buttons) */}
                <div className="p-2 bg-background/50">
                    <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-[14px] border border-cardAccent">
                        {[
                            { id: 'dine-in', icon: Utensils, label: t('dine-in') },
                            { id: 'takeaway', icon: ShoppingBag, label: t('takeaway') },
                            { id: 'delivery', icon: Bike, label: t('delivery') }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setOrderType(type.id as any)}
                                className={`flex items-center justify-center py-1.5 px-0.5 rounded-[10px] transition-all gap-1 ${orderType === type.id ? 'bg-primary text-background shadow-md scale-105 z-10 font-black' : 'text-secondary hover:text-textPrimary'}`}
                            >
                                <type.icon size={11} />
                                <span className="text-[7.5px] font-black uppercase tracking-tighter">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Selection */}
                {orderType === 'dine-in' && (
                    <div className="px-3 py-1.5 border-b border-cardAccent flex items-center justify-between bg-accentBlue/5">
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={12} className="text-accentBlue" />
                            <span className="text-[9px] font-black text-textPrimary">الطاولة:</span>
                        </div>
                        <select
                            className="bg-transparent border-none text-[9px] font-black text-accentBlue outline-none cursor-pointer"
                            value={selectedTableId || ''}
                            onChange={(e) => setSelectedTableId(e.target.value)}
                        >
                            <option value="">اختر...</option>
                            {tables.map(table => (
                                <option key={table.id} value={table.id} disabled={table.status === 'occupied'}>
                                    {table.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Cart List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-secondary opacity-20">
                            <ShoppingBag size={40} />
                            <p className="text-[10px] font-black mt-2">السلة فارغة</p>
                        </div>
                    ) : cart.map((item, idx) => {
                        const color = getCategoryColor(item.categoryId);
                        return (
                            <div key={idx} className="bg-background/40 p-2.5 rounded-[18px] border border-cardAccent flex flex-col gap-2 group animate-in slide-in-from-right duration-200">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-textPrimary text-[11px] truncate leading-tight">{language === 'ar' ? item.nameAr : item.nameEn}</h4>
                                        {item.selectedVariant && <p className="text-[8px] font-bold text-accentBlue mt-0.5">({item.selectedVariant.nameAr})</p>}
                                    </div>
                                    <p style={{ color }} className="text-[11px] font-black">{(item.totalItemPrice * item.quantity).toFixed(2)}</p>
                                </div>

                                <div className="flex items-center justify-between pt-1.5 border-t border-cardAccent/20">
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setNoteModal({ show: true, index: idx, value: item.notes || '' })} className="p-1 text-secondary hover:text-accentBlue"><MessageSquare size={12} /></button>
                                        <button onClick={() => removeFromCart(idx)} className="p-1 text-red-500/30 hover:text-red-500"><Trash2 size={12} /></button>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background px-2 py-1 rounded-xl border border-cardAccent">
                                        <button onClick={() => updateQuantity(idx, -1)} className="text-secondary hover:text-primary"><Minus size={10} /></button>
                                        <span className="text-[10px] font-black text-textPrimary w-3 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(idx, 1)} className="text-secondary hover:text-primary"><Plus size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Totals & Actions */}
                <div className="p-4 bg-background/80 border-t border-cardAccent space-y-3 shadow-lg">
                    <div className="space-y-1">
                        <div className="flex justify-between text-secondary text-[9px] font-bold">
                            <span>المجموع</span>
                            <span>{subtotal.toFixed(2)} {currency}</span>
                        </div>
                        <div className="flex justify-between text-base font-black text-textPrimary pt-2 border-t border-cardAccent/30">
                            <span className="text-primary">الإجمالي</span>
                            <span className="text-primary">{total.toFixed(2)} <span className="text-[9px] opacity-60">{currency}</span></span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="المبلغ المستلم..."
                                className="w-full h-9 pr-3 pl-3 bg-background border border-cardAccent rounded-xl text-base font-black text-accentGreen placeholder:text-[10px] outline-none text-center"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                            />
                            <Banknote size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary opacity-30" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                disabled={cart.length === 0}
                                onClick={() => finalizeOrder('cash')}
                                className="flex flex-col items-center justify-center py-2 bg-accentGreen text-background rounded-xl font-black text-[12px] shadow-sm active:scale-95 disabled:opacity-30"
                            >
                                <Coins size={16} className="mb-0.5" /> نقدي
                            </button>
                            <button
                                disabled={cart.length === 0}
                                onClick={() => finalizeOrder('card')}
                                className="flex flex-col items-center justify-center py-2 bg-accentBlue text-background rounded-xl font-black text-[12px] shadow-sm active:scale-95 disabled:opacity-30"
                            >
                                <CreditCard size={16} className="mb-0.5" /> بطاقة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Standard Modals --- */}

            {/* Product Selection Modal */}
            {selectionModal.show && selectionModal.product && (
                <Modal isOpen={selectionModal.show} onClose={() => setSelectionModal({ show: false })}>
                    <Modal.Header title="تخصيص الصنف" subtitle={language === 'ar' ? selectionModal.product.nameAr : selectionModal.product.nameEn} />
                    <Modal.Body>
                        <div className="space-y-5">
                            {selectionModal.product.variants.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-secondary uppercase flex items-center gap-1"><Settings2 size={12} /> الحجم / النوع</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectionModal.product.variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVar(v)}
                                                className={`p-3 rounded-xl border-2 text-right transition-all ${selectedVar?.id === v.id ? 'border-primary bg-primary/5 text-textPrimary font-black' : 'border-cardAccent text-secondary'}`}
                                            >
                                                <p className="text-[13px]">{v.nameAr}</p>
                                                <p className="text-[10px] opacity-60 mt-0.5">{v.price} {currency}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectionModal.product.addons.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-secondary uppercase flex items-center gap-1"><Plus size={12} /> الإضافات</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectionModal.product.addons.map(a => {
                                            const isSel = selectedAds.some(item => item.id === a.id);
                                            return (
                                                <button
                                                    key={a.id}
                                                    onClick={() => isSel ? setSelectedAds(selectedAds.filter(i => i.id !== a.id)) : setSelectedAds([...selectedAds, a])}
                                                    className={`p-3 rounded-xl border-2 text-right transition-all ${isSel ? 'border-accentGreen bg-accentGreen/5 text-textPrimary font-black' : 'border-cardAccent text-secondary'}`}
                                                >
                                                    <p className="text-[13px]">{a.nameAr}</p>
                                                    <p className="text-[10px] opacity-60">+{a.price}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button fullWidth size="lg" onClick={handleConfirmSelection}>تأكيد الإضافة</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Item Note Modal */}
            {noteModal.show && (
                <Modal isOpen={noteModal.show} onClose={() => setNoteModal({ show: false, value: '' })}>
                    <Modal.Header title="إضافة ملاحظة" />
                    <Modal.Body>
                        <Input autoFocus placeholder="مثلاً: بدون بصل..." className="h-14 text-base font-bold" value={noteModal.value} onChange={e => setNoteModal({ ...noteModal, value: e.target.value })} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button fullWidth onClick={() => { if (noteModal.index !== undefined) updateItemNote(noteModal.index, noteModal.value); setNoteModal({ show: false, value: '' }); }}>حفظ</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Held Orders Modal */}
            {showHeldModal && (
                <Modal isOpen={showHeldModal} onClose={() => setShowHeldModal(false)}>
                    <Modal.Header title="الطلبات المعلقة" />
                    <Modal.Body>
                        {heldOrders.length === 0 ? <p className="text-center py-10 opacity-30 italic font-black">لا توجد طلبات</p> : (
                            <div className="space-y-2">
                                {heldOrders.map(o => (
                                    <div key={o.id} className="bg-background p-3 rounded-2xl border border-cardAccent flex justify-between items-center group">
                                        <div>
                                            <p className="font-black text-sm">طلب #{o.id.slice(-4)}</p>
                                            <p className="text-[10px] text-secondary font-bold">{new Date(o.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <button onClick={() => { resumeOrder(o.id); setShowHeldModal(false); }} className="bg-primary/10 text-primary p-2 rounded-xl hover:bg-primary hover:text-background transition-all">
                                            <PlayCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            )}

            {/* Success Modal */}
            {showSuccessModal && lastOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 no-print text-center">
                    <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-sm shadow-2xl p-10 animate-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-accentGreen/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accentGreen/20">
                            <CheckCircle2 size={36} className="text-accentGreen" />
                        </div>
                        <h3 className="text-2xl font-black text-textPrimary mb-1">تم بنجاح!</h3>
                        <p className="text-secondary font-bold text-xs mb-8">رقم الفاتورة: <span className="text-primary font-black">#{lastOrder.id}</span></p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handlePrintOrder(lastOrder, 'thermal')}
                                className="flex flex-col items-center justify-center py-3 bg-primary text-background rounded-2xl font-black text-xs"
                            >
                                <Printer size={18} />
                                <span className="mt-1">حراري</span>
                            </button>
                            <button
                                onClick={() => handlePrintOrder(lastOrder, 'a4')}
                                className="flex flex-col items-center justify-center py-3 bg-accentBlue text-background rounded-2xl font-black text-xs"
                            >
                                <FileText size={18} />
                                <span className="mt-1">A4</span>
                            </button>
                            <button onClick={resetPOS} className="flex flex-col items-center justify-center py-3 bg-cardAccent text-textPrimary rounded-2xl font-black text-xs border border-cardAccent">
                                <Plus size={18} />
                                <span className="mt-1">جديد</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Modal */}
            {showShiftModal && (
                <Modal isOpen={showShiftModal} onClose={() => { if (activeShift) setShowShiftModal(false); }}>
                    <Modal.Header title="بدء الوردية" />
                    <Modal.Body>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2 text-right">عهدة البداية</label>
                            <input type="number" autoFocus className="w-full p-4 bg-background border border-cardAccent rounded-xl text-textPrimary font-black text-2xl text-center outline-none" value={shiftStartBalance || ''} onChange={e => setShiftStartBalance(Number(e.target.value))} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button fullWidth onClick={handleOpenShift}>تأكيد البدء</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Receipt Template (Hidden) */}
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white text-black">
                {lastOrder && (
                    <ReceiptTemplate
                        order={lastOrder}
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

export default POS;
