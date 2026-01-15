import React, { useState } from 'react';
import { Search, Filter, Download, Activity, Building2, CreditCard, Settings, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuditLog } from '../../types/superAdminTypes';

const mockLogs: AuditLog[] = [
    { id: '1', action: 'Tenant Suspended', performedBy: 'Super Admin', targetType: 'tenant', targetId: 't-001', details: 'Suspended "مطعم الأصيل" for non-payment', timestamp: '2026-01-12T22:00:00', ipAddress: '192.168.1.1' },
    { id: '2', action: 'Plan Updated', performedBy: 'Super Admin', targetType: 'subscription', targetId: 'p-002', details: 'Updated Pro plan price from $180 to $199', timestamp: '2026-01-12T18:30:00', ipAddress: '192.168.1.1' },
    { id: '3', action: 'New Tenant Created', performedBy: 'System', targetType: 'tenant', targetId: 't-148', details: 'New restaurant "كافيه النخبة" registered via self-signup', timestamp: '2026-01-12T14:15:00' },
    { id: '4', action: 'Settings Changed', performedBy: 'Admin User', targetType: 'setting', targetId: 's-001', details: 'Changed default trial days from 7 to 14', timestamp: '2026-01-11T10:00:00', ipAddress: '10.0.0.5' },
    { id: '5', action: 'Admin Login', performedBy: 'Super Admin', targetType: 'admin', targetId: 'a-001', details: 'Successful login from new device', timestamp: '2026-01-11T09:00:00', ipAddress: '192.168.1.1' },
    { id: '6', action: 'Tenant Reactivated', performedBy: 'Super Admin', targetType: 'tenant', targetId: 't-089', details: 'Reactivated "بيتزا الشرق" after payment received', timestamp: '2026-01-10T16:45:00', ipAddress: '192.168.1.1' },
    { id: '7', action: 'Login As Tenant', performedBy: 'Admin User', targetType: 'tenant', targetId: 't-045', details: 'Impersonated admin of "شاورما الملك" for support', timestamp: '2026-01-10T11:30:00', ipAddress: '10.0.0.5' },
];

const AuditLogs: React.FC = () => {
    const [logs] = useState<AuditLog[]>(mockLogs);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filtered = logs.filter(l => {
        const matchesSearch = l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase()) || l.performedBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || l.targetType === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getIcon = (type: string) => {
        const icons: Record<string, React.ElementType> = { tenant: Building2, subscription: CreditCard, setting: Settings, admin: Shield };
        const Icon = icons[type] || Activity;
        return <Icon size={18} />;
    };

    const getColor = (type: string) => {
        const colors: Record<string, string> = { tenant: '#6366f1', subscription: '#8b5cf6', setting: '#f59e0b', admin: '#22c55e' };
        return colors[type] || '#64748b';
    };

    const formatTime = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="sa-page-title">Audit Logs</h1>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Track all administrative actions</p>
                </div>
                <button className="sa-btn sa-btn-ghost"><Download size={18} /> Export Logs</button>
            </div>

            {/* Filters */}
            <div className="sa-glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text-secondary)' }} />
                        <input type="text" placeholder="Search actions, details, or users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 44px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px 16px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', cursor: 'pointer' }}>
                        <option value="all">All Types</option>
                        <option value="tenant">Tenant</option>
                        <option value="subscription">Subscription</option>
                        <option value="setting">Setting</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Logs Timeline */}
            <div className="sa-glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {paginated.map((log, idx) => (
                        <div key={log.id} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: idx < paginated.length - 1 ? '1px solid var(--sa-border)' : undefined }}>
                            <div style={{ width: '44px', height: '44px', background: `${getColor(log.targetType)}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(log.targetType), flexShrink: 0 }}>
                                {getIcon(log.targetType)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '15px' }}>{log.action}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--sa-text-secondary)', marginTop: '4px' }}>{log.details}</p>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--sa-text-secondary)', whiteSpace: 'nowrap' }}>{formatTime(log.timestamp)}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--sa-text-secondary)' }}>
                                    <span>By: <strong style={{ color: 'var(--sa-text-primary)' }}>{log.performedBy}</strong></span>
                                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                    <span style={{ padding: '2px 8px', background: `${getColor(log.targetType)}15`, borderRadius: '6px', color: getColor(log.targetType), fontWeight: 600, textTransform: 'capitalize' }}>{log.targetType}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--sa-border)' }}>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px' }}>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="sa-btn sa-btn-ghost" style={{ padding: '8px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}><ChevronLeft size={18} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="sa-btn sa-btn-ghost" style={{ padding: '8px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
