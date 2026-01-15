// الإعدادات - إدارة المستخدمين
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Plus, Search, XCircle, Edit3, Trash2, Shield } from 'lucide-react';

interface User { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; }

const UserManagement: React.FC = () => {
    const { language } = useLanguage();
    const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('system_users') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', role: 'cashier', password: '' });

    const roles = [
        { id: 'admin', ar: 'مدير النظام', en: 'Admin' },
        { id: 'manager', ar: 'مدير', en: 'Manager' },
        { id: 'accountant', ar: 'محاسب', en: 'Accountant' },
        { id: 'cashier', ar: 'كاشير', en: 'Cashier' },
        { id: 'chef', ar: 'شيف', en: 'Chef' }
    ];

    const save = (data: User[]) => { localStorage.setItem('system_users', JSON.stringify(data)); setUsers(data); };

    const handleAdd = () => {
        if (!formData.name || !formData.email) return;
        save([...users, { id: Date.now().toString(), name: formData.name, email: formData.email, role: formData.role, isActive: true, createdAt: new Date().toISOString().split('T')[0] }]);
        setShowModal(false); setFormData({ name: '', email: '', role: 'cashier', password: '' });
    };

    const toggleActive = (id: string) => save(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    const deleteUser = (id: string) => { if (confirm(language === 'ar' ? 'حذف المستخدم؟' : 'Delete user?')) save(users.filter(u => u.id !== id)); };

    const filtered = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const stats = useMemo(() => ({ total: users.length, active: users.filter(u => u.isActive).length }), [users]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>
                <div className="flex gap-3">
                    <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-48" /></div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Plus size={20} />{language === 'ar' ? 'مستخدم جديد' : 'New User'}</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p><p className="text-2xl font-black text-textPrimary">{stats.total}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مستخدمين نشطين' : 'Active Users'}</p><p className="text-2xl font-black text-accentGreen">{stats.active}</p></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'البريد' : 'Email'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصلاحية' : 'Role'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا يوجد مستخدمين' : 'No users'}</td></tr> :
                            filtered.map(u => (
                                <tr key={u.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 font-black text-textPrimary">{u.name}</td>
                                    <td className="p-5 text-secondary">{u.email}</td>
                                    <td className="p-5 text-center"><span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary">{roles.find(r => r.id === u.role)?.[language === 'ar' ? 'ar' : 'en']}</span></td>
                                    <td className="p-5 text-center"><button onClick={() => toggleActive(u.id)} className={`px-3 py-1 rounded-full text-xs font-black ${u.isActive ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>{u.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}</button></td>
                                    <td className="p-5 text-center"><button onClick={() => deleteUser(u.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
                    <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{language === 'ar' ? 'مستخدم جديد' : 'New User'}</h3><button onClick={() => setShowModal(false)} className="text-secondary"><XCircle size={32} /></button></div>
                    <div className="space-y-4">
                        <input placeholder={language === 'ar' ? 'الاسم' : 'Name'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} type="email" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <input placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'} type="password" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>{roles.map(r => <option key={r.id} value={r.id}>{language === 'ar' ? r.ar : r.en}</option>)}</select>
                        <button onClick={handleAdd} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{language === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default UserManagement;
