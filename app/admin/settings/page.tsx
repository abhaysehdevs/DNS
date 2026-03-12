
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Globe, Trash2, ShieldCheck, Database, Bell, ShoppingBag, Palette, Moon, Sun, Monitor, Upload, Download, Loader2, LogOut, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
    const { adminSettings, updateAdminSettings } = useAppStore();

    // We use local state for the form to allow "canceling" changes if we wanted, 
    // but for this implementation we will sync directly with the store for immediate persistence
    // and use the Save button as a visual confirmation.

    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSessions();
            setCurrentSessionId(localStorage.getItem('admin_session_id'));
        }
    }, [activeTab]);

    const fetchSessions = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('admin_sessions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('last_active', { ascending: false });

        if (!error && data) {
            setSessions(data);
        }
    };

    const handleRevokeSession = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        if (!confirm('Are you sure you want to revoke this session? The device will be logged out.')) return;

        const { error } = await supabase
            .from('admin_sessions')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (!error) {
            setSessions(sessions.filter(s => s.id !== id));
            if (id === currentSessionId) {
                alert('You have revoked your current session. You will be logged out.');
                window.location.reload();
            }
        } else {
            alert('Failed to revoke session: ' + error.message);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'store', label: 'Store Info', icon: ShoppingBag },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'data', label: 'Data & Backup', icon: Database },
        { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
        { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
    ];

    const handleSaveSettings = async () => {
        setLoading(true);
        // Simulate API call to save to backend if we had one
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
        // Since we are using Zustand persist, data is already saved to localStorage
        // This is just for user feedback
        alert('Settings saved successfully!');
    };

    const handleExportData = async () => {
        try {
            const { data: products } = await supabase.from('products').select('*');
            const { data: orders } = await supabase.from('orders').select('*');

            const backup = {
                timestamp: new Date().toISOString(),
                store: adminSettings.storeName,
                settings: adminSettings,
                products: products || [],
                orders: orders || []
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dinanath_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Export failed. Please try again.');
            console.error(error);
        }
    };

    const handleResetDatabase = async () => {
        const confirmText = prompt('Type "DELETE" to confirm deleting ALL products and orders permanently. This cannot be undone.');
        if (confirmText === 'DELETE') {
            setResetLoading(true);
            try {
                // Delete logic
                await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

                alert('Database cleared successfully. Please reload/seed data.');
            } catch (error: any) {
                alert('Error clearing database: ' + error.message);
            } finally {
                setResetLoading(false);
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto min-h-screen text-gray-100 pb-20 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
                    <p className="text-gray-400 text-sm">Manage store configuration and preferences.</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden sticky top-24 shadow-lg">
                        <nav className="flex flex-col p-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-900/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-800 mt-2">
                            <div className="text-xs text-gray-500 text-center">
                                v1.2.0 • Build 2026.02
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <Globe className="text-blue-500" size={24} /> General Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Store Name</label>
                                        <input
                                            type="text"
                                            value={adminSettings.storeName}
                                            onChange={(e) => updateAdminSettings({ storeName: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Admin Email</label>
                                        <input
                                            type="email"
                                            value={adminSettings.adminEmail}
                                            onChange={(e) => updateAdminSettings({ adminEmail: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Default Currency</label>
                                        <select
                                            value={adminSettings.currency}
                                            onChange={(e) => updateAdminSettings({ currency: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Language</label>
                                        <select
                                            value={adminSettings.language}
                                            onChange={(e) => updateAdminSettings({ language: e.target.value as any })}
                                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                                        >
                                            <option value="en">English (Default)</option>
                                            <option value="hi">Hindi</option>
                                            <option value="mr">Marathi</option>
                                            <option value="gu">Gujarati</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <Palette className="text-purple-500" size={24} /> Appearance
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-800">
                                        <div>
                                            <h3 className="font-medium text-white mb-1">Theme Mode</h3>
                                            <p className="text-xs text-gray-400">Select your preferred interface theme.</p>
                                        </div>
                                        <div className="flex bg-black p-1 rounded-lg border border-gray-700">
                                            <button
                                                onClick={() => updateAdminSettings({ theme: 'light' })}
                                                className={`p-2 rounded-md transition-all ${adminSettings.theme === 'light' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Sun size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateAdminSettings({ theme: 'dark' })}
                                                className={`p-2 rounded-md transition-all ${adminSettings.theme === 'dark' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Moon size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateAdminSettings({ theme: 'system' })}
                                                className={`p-2 rounded-md transition-all ${adminSettings.theme === 'system' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Monitor size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Store Info */}
                    {activeTab === 'store' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <ShoppingBag className="text-green-500" size={24} /> Store Configuration
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-white">Maintenance Mode</label>
                                            <p className="text-xs text-gray-400">Temporarily disable the public store frontend.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={adminSettings.maintenanceMode}
                                                onChange={e => updateAdminSettings({ maintenanceMode: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="h-px bg-gray-800 w-full"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Tax Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={adminSettings.taxRate}
                                                    onChange={(e) => updateAdminSettings({ taxRate: Number(e.target.value) })}
                                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <Bell className="text-amber-500" size={24} /> Notification Preferences
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Bell size={20} /></div>
                                            <div>
                                                <h3 className="font-medium text-white">Order Emails</h3>
                                                <p className="text-xs text-gray-400">Receive emails for new orders placed.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={adminSettings.emailNotifications}
                                                onChange={e => updateAdminSettings({ emailNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><ShoppingBag size={20} /></div>
                                            <div>
                                                <h3 className="font-medium text-white">Low Stock Alerts</h3>
                                                <p className="text-xs text-gray-400">Get notified when product stock is low.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={adminSettings.stockAlerts}
                                                onChange={e => updateAdminSettings({ stockAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data & Backup */}
                    {activeTab === 'data' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <Database className="text-purple-500" size={24} /> Data Management
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border border-gray-800 rounded-xl bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                                        <Download className="text-blue-500 mb-4" size={32} />
                                        <h3 className="text-lg font-bold text-white mb-2">Export Data</h3>
                                        <p className="text-sm text-gray-400 mb-4">Download a JSON backup of all your products, orders, and customer data.</p>
                                        <button
                                            onClick={handleExportData}
                                            className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg border border-blue-600/30 transition-colors font-medium text-sm"
                                        >
                                            Download Backup
                                        </button>
                                    </div>

                                    <div className="p-6 border border-gray-800 rounded-xl bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                                        <Upload className="text-green-500 mb-4" size={32} />
                                        <h3 className="text-lg font-bold text-white mb-2">Import Data</h3>
                                        <p className="text-sm text-gray-400 mb-4">Restore your store data from a previous backup file.</p>
                                        <button
                                            disabled
                                            className="w-full py-2 bg-gray-800 text-gray-500 rounded-lg border border-gray-700 cursor-not-allowed font-medium text-sm"
                                        >
                                            Upload Backup (Coming Soon)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security & Sessions */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <ShieldCheck className="text-green-500" size={24} /> Active Sessions
                                </h2>

                                <p className="text-sm text-gray-400 mb-6">
                                    Manage devices that are currently logged into your admin account. <br />
                                    If you see any suspicious activity, revoke the session immediately.
                                </p>

                                <div className="space-y-4">
                                    {sessions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-lg">
                                            <Loader2 className="animate-spin mx-auto mb-2" />
                                            Loading active sessions...
                                        </div>
                                    ) : (
                                        sessions.map((session) => {
                                            const isCurrent = session.id === currentSessionId;
                                            const isMobile = /mobile/i.test(session.device_info || '');

                                            // Parse basic browser info
                                            let browser = 'Unknown Browser';
                                            if (session.device_info?.includes('Chrome')) browser = 'Chrome';
                                            else if (session.device_info?.includes('Firefox')) browser = 'Firefox';
                                            else if (session.device_info?.includes('Safari') && !session.device_info?.includes('Chrome')) browser = 'Safari';
                                            else if (session.device_info?.includes('Edg')) browser = 'Edge';

                                            return (
                                                <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isCurrent ? 'bg-blue-900/10 border-blue-500/50' : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-lg ${isCurrent ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                                            {isMobile ? <Monitor size={20} /> : <Monitor size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-white text-sm">
                                                                    {browser} on {isMobile ? 'Mobile' : 'Desktop'}
                                                                </h3>
                                                                {isCurrent && (
                                                                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CURRENT</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1 font-mono">
                                                                IP: {session.ip_address} • Last active: {new Date(session.last_active).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRevokeSession(session.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                                                        title="Revoke Access"
                                                    >
                                                        <LogOut size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'danger' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500">
                                    <ShieldCheck size={24} /> Danger Zone
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-white">Reset Database</h3>
                                            <p className="text-xs text-red-300/60">Permanently delete all products, orders, and customer data. This action is irreversible.</p>
                                        </div>
                                        <button
                                            className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                                            onClick={handleResetDatabase}
                                            disabled={resetLoading}
                                        >
                                            {resetLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                            Delete All Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
