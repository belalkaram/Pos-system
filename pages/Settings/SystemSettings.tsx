// الإعدادات - إعدادات النظام
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Settings, Save, Globe, Palette, Bell, Printer } from 'lucide-react';

const SystemSettings: React.FC = () => {
    const { language } = useLanguage();
    const { settings, updateSettings } = useData();

    const [formData, setFormData] = useState({
        restaurantNameAr: settings.restaurantNameAr || '',
        restaurantNameEn: settings.restaurantNameEn || '',
        currencyAr: settings.currencyAr || 'ج.م',
        currencyEn: settings.currencyEn || 'EGP',
        taxRate: settings.taxRate || 14,
        phone: settings.phone || '',
        address: settings.address || '',
        receiptFooter: settings.receiptFooter || ''
    });

    const handleSave = () => {
        updateSettings(formData);
        alert(language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved');
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'إعدادات النظام' : 'System Settings'}</h2>
                <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Save size={20} />{language === 'ar' ? 'حفظ' : 'Save'}</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <h3 className="font-black text-textPrimary mb-4 flex items-center gap-2"><Globe size={20} className="text-primary" />{language === 'ar' ? 'معلومات المنشأة' : 'Business Info'}</h3>
                    <div className="space-y-4">
                        <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'اسم المنشأة (عربي)' : 'Business Name (AR)'}</label><input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.restaurantNameAr} onChange={e => setFormData({ ...formData, restaurantNameAr: e.target.value })} /></div>
                        <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'اسم المنشأة (إنجليزي)' : 'Business Name (EN)'}</label><input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.restaurantNameEn} onChange={e => setFormData({ ...formData, restaurantNameEn: e.target.value })} /></div>
                        <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</label><input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                        <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'العنوان' : 'Address'}</label><input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <h3 className="font-black text-textPrimary mb-4 flex items-center gap-2"><Palette size={20} className="text-primary" />{language === 'ar' ? 'إعدادات العملة والضريبة' : 'Currency & Tax'}</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'العملة (عربي)' : 'Currency (AR)'}</label><input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.currencyAr} onChange={e => setFormData({ ...formData, currencyAr: e.target.value })} /></div>
                            <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'العملة (إنجليزي)' : 'Currency (EN)'}</label><input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.currencyEn} onChange={e => setFormData({ ...formData, currencyEn: e.target.value })} /></div>
                        </div>
                        <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}</label><input type="number" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })} /></div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-3xl border border-cardAccent lg:col-span-2">
                    <h3 className="font-black text-textPrimary mb-4 flex items-center gap-2"><Printer size={20} className="text-primary" />{language === 'ar' ? 'إعدادات الطباعة' : 'Print Settings'}</h3>
                    <div><label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'تذييل الفاتورة' : 'Receipt Footer'}</label><textarea className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold h-24" value={formData.receiptFooter} onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })} /></div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
