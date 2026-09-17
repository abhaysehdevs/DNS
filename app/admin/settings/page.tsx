
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Globe, Trash2, ShieldCheck, Database, Bell, ShoppingBag, Palette, Moon, Sun, Monitor, Upload, Download, Loader2, LogOut, AlertCircle, Sparkles, Bot, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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

    // AI Assistant Configuration State
    const [testAiLoading, setTestAiLoading] = useState(false);
    const [testAiResult, setTestAiResult] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('settings')
                    .eq('key', 'global')
                    .single();
                if (!error && data?.settings) {
                    updateAdminSettings(data.settings);
                }
            } catch (err) {
                console.error('Error loading settings from DB:', err);
            }
        };
        loadSettings();
    }, []);

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
        { id: 'ai', label: 'AI Assistant', icon: Sparkles },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'data', label: 'Data & Backup', icon: Database },
        { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
        { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
    ];

    const handleTestAi = async () => {
        setTestAiLoading(true);
        setTestAiResult(null);
        try {
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';
            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-admin-email': adminEmail
                },
                body: JSON.stringify({
                    apiKey: adminSettings.geminiApiKey,
                    messages: [{ role: 'user', content: 'Connection test: Say hello to Dinanath & Sons!' }]
                })
            });
            const data = await res.json();
            if (res.ok) {
                setTestAiResult(`✅ Success: ${data.reply}`);
            } else {
                setTestAiResult(`❌ Error: ${data.error || 'Failed to connect'}`);
            }
        } catch (err: any) {
            setTestAiResult(`❌ Connection error: ${err.message}`);
        } finally {
            setTestAiLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'global',
                    settings: adminSettings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            alert('Settings saved and synchronized with database successfully!');
        } catch (err: any) {
            alert('Failed to save to database: ' + err.message);
        } finally {
            setLoading(false);
        }
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
        <div className="max-w-6xl mx-auto min-h-screen text-[#18181B] pb-20 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#18181B] mb-1">Settings</h1>
                    <p className="text-[#71717A] text-sm">Manage store configuration and preferences.</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-[#966E2E] hover:bg-[#7D5A25] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white border border-[#E8E2D5] rounded-xl overflow-hidden sticky top-24 shadow-sm">
                        <nav className="flex flex-col p-2 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id
                                        ? 'bg-[#966E2E] text-white shadow-sm'
                                        : 'text-[#52525B] hover:bg-[#FAF9F5] hover:text-[#18181B]'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-[#E8E2D5] mt-2">
                            <div className="text-xs text-[#71717A] text-center">
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
                            <div className="bg-white border border-[#E8E2D5] rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <Globe className="text-[#966E2E]" size={24} /> General Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B]">Store Name</label>
                                        <input
                                            type="text"
                                            value={adminSettings.storeName}
                                            onChange={(e) => updateAdminSettings({ storeName: e.target.value })}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B]">Default Currency</label>
                                        <select
                                            value={adminSettings.currency}
                                            onChange={(e) => updateAdminSettings({ currency: e.target.value })}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B]">Language</label>
                                        <select
                                            value={adminSettings.language}
                                            onChange={(e) => updateAdminSettings({ language: e.target.value as any })}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                        >
                                            <option value="en">English (Default)</option>
                                            <option value="hi">Hindi</option>
                                            <option value="mr">Marathi</option>
                                            <option value="gu">Gujarati</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Store Info */}
                    {activeTab === 'store' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-white border border-[#E8E2D5] rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <ShoppingBag className="text-emerald-600" size={24} /> Store Configuration
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-[#18181B]">Maintenance Mode</label>
                                            <p className="text-xs text-[#71717A]">Temporarily disable the public store frontend.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={adminSettings.maintenanceMode}
                                                onChange={e => updateAdminSettings({ maintenanceMode: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#966E2E]"></div>
                                        </label>
                                    </div>
                                    <div className="h-px bg-[#E8E2D5] w-full"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#52525B]">Tax Rate (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={adminSettings.taxRate}
                                                    onChange={(e) => updateAdminSettings({ taxRate: Number(e.target.value) })}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]">%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#52525B]">Tax ID (GSTIN/VAT)</label>
                                            <input
                                                type="text"
                                                value={adminSettings.taxId || ''}
                                                onChange={(e) => updateAdminSettings({ taxId: e.target.value })}
                                                placeholder="e.g. GSTIN27AAAAA1111A1Z1"
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-[#52525B]">Legal Business Name</label>
                                            <input
                                                type="text"
                                                value={adminSettings.legalBusinessName || ''}
                                                onChange={(e) => updateAdminSettings({ legalBusinessName: e.target.value })}
                                                placeholder="e.g. Dinanath & Sons Private Limited"
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-[#52525B]">Global Shipping Origin</label>
                                            <textarea
                                                value={adminSettings.shippingOrigin || ''}
                                                onChange={(e) => updateAdminSettings({ shippingOrigin: e.target.value })}
                                                placeholder="e.g. Maliwara, Chandni Chowk, New Delhi, India"
                                                rows={2}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="h-px bg-[#E8E2D5] w-full mt-6"></div>

                                    {/* Social Links */}
                                    <div className="mt-6 space-y-4">
                                        <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">Social Profiles</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-[#52525B]">Facebook URL</label>
                                                <input
                                                    type="text"
                                                    value={adminSettings.socialLinks?.facebook || ''}
                                                    onChange={(e) => updateAdminSettings({
                                                        socialLinks: { ...adminSettings.socialLinks, facebook: e.target.value }
                                                    })}
                                                    placeholder="https://facebook.com/..."
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-2.5 text-xs text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-[#52525B]">Instagram URL</label>
                                                <input
                                                    type="text"
                                                    value={adminSettings.socialLinks?.instagram || ''}
                                                    onChange={(e) => updateAdminSettings({
                                                        socialLinks: { ...adminSettings.socialLinks, instagram: e.target.value }
                                                    })}
                                                    placeholder="https://instagram.com/..."
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-2.5 text-xs text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-[#52525B]">Twitter/X URL</label>
                                                <input
                                                    type="text"
                                                    value={adminSettings.socialLinks?.twitter || ''}
                                                    onChange={(e) => updateAdminSettings({
                                                        socialLinks: { ...adminSettings.socialLinks, twitter: e.target.value }
                                                    })}
                                                    placeholder="https://twitter.com/..."
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-2.5 text-xs text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-[#52525B]">LinkedIn URL</label>
                                                <input
                                                    type="text"
                                                    value={adminSettings.socialLinks?.linkedin || ''}
                                                    onChange={(e) => updateAdminSettings({
                                                        socialLinks: { ...adminSettings.socialLinks, linkedin: e.target.value }
                                                    })}
                                                    placeholder="https://linkedin.com/company/..."
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-2.5 text-xs text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                                />
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
                            <div className="bg-white border border-[#E8E2D5] rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <Bell className="text-[#966E2E]" size={24} /> Notification Preferences
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-lg border border-[#E8E2D5]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#966E2E]/10 rounded-lg text-[#966E2E]"><Bell size={20} /></div>
                                            <div>
                                                <h3 className="font-medium text-[#18181B]">Order Emails</h3>
                                                <p className="text-xs text-[#71717A]">Receive emails for new orders placed.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={adminSettings.emailNotifications}
                                                onChange={e => updateAdminSettings({ emailNotifications: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#966E2E]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-lg border border-[#E8E2D5]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600"><ShoppingBag size={20} /></div>
                                            <div>
                                                <h3 className="font-medium text-[#18181B]">Low Stock Alerts</h3>
                                                <p className="text-xs text-[#71717A]">Get notified when product stock is low.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={adminSettings.stockAlerts}
                                                onChange={e => updateAdminSettings({ stockAlerts: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#966E2E]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data & Backup */}
                    {activeTab === 'data' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-white border border-[#E8E2D5] rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <Database className="text-[#966E2E]" size={24} /> Data Management
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border border-[#E8E2D5] rounded-xl bg-[#FAF9F5] transition-colors">
                                        <Download className="text-[#966E2E] mb-4" size={32} />
                                        <h3 className="text-lg font-bold text-[#18181B] mb-2">Export Data</h3>
                                        <p className="text-sm text-[#71717A] mb-4">Download a JSON backup of all your products, orders, and customer data.</p>
                                        <button
                                            onClick={handleExportData}
                                            className="w-full py-2 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
                                        >
                                            Download Backup
                                        </button>
                                    </div>

                                    <div className="p-6 border border-[#E8E2D5] rounded-xl bg-[#FAF9F5] transition-colors">
                                        <Upload className="text-emerald-600 mb-4" size={32} />
                                        <h3 className="text-lg font-bold text-[#18181B] mb-2">Import Data</h3>
                                        <p className="text-sm text-[#71717A] mb-4">Restore your store data from a previous backup file.</p>
                                        <button
                                            disabled
                                            className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg border border-gray-300 cursor-not-allowed font-medium text-sm"
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
                            
                            {/* BIOMETRIC HARDWARE SECURITY CONSOLE */}
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#966E2E]/10 border border-[#966E2E]/20 text-[#966E2E] flex items-center justify-center">
                                            <ShieldCheck size={22} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-[#18181B] uppercase tracking-wider">Hardware Biometrics & Fingerprint Console</h2>
                                            <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-0.5">Secure Operator Hardware Binding (Windows Hello / Touch ID)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="text-xs font-bold text-[#18181B] uppercase tracking-wide flex items-center gap-2">
                                            <span>Device Status:</span>
                                            {typeof window !== 'undefined' && localStorage.getItem('dns_admin_biometric_cred_id') ? (
                                                <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck size={14} /> Biometrics Linked & Active</span>
                                            ) : (
                                                <span className="text-[#71717A]">No Biometric Credentials Enrolled</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-[#71717A] leading-relaxed mt-1">
                                            Only authenticated operators can bind hardware fingerprint credentials from inside this secure console.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={async () => {
                                                const { registerBiometrics } = await import('@/lib/webauthn');
                                                const ok = await registerBiometrics();
                                                if (ok) {
                                                    alert('Hardware fingerprint / biometrics successfully linked to this device!');
                                                    window.location.reload();
                                                } else {
                                                    alert('Biometric enrollment failed or was cancelled.');
                                                }
                                            }}
                                            className="px-4 py-2.5 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold uppercase text-[9.5px] tracking-wider rounded-xl transition-all shadow-sm cursor-pointer border-none"
                                        >
                                            Link My Biometrics to Device
                                        </button>
                                        
                                        {typeof window !== 'undefined' && localStorage.getItem('dns_admin_biometric_cred_id') && (
                                            <button
                                                onClick={() => {
                                                    const { clearBiometrics } = require('@/lib/webauthn');
                                                    clearBiometrics();
                                                    alert('Biometric credentials unlinked from this device.');
                                                    window.location.reload();
                                                }}
                                                className="px-3 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold uppercase text-[9.5px] tracking-wider rounded-xl transition-all cursor-pointer"
                                            >
                                                Unlink
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-[#E8E2D5] rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <ShieldCheck className="text-emerald-600" size={24} /> Active Sessions
                                </h2>

                                <p className="text-sm text-[#71717A] mb-6">
                                    Manage devices that are currently logged into your admin account. <br />
                                    If you see any suspicious activity, revoke the session immediately.
                                </p>

                                <div className="space-y-4">
                                    {sessions.length === 0 ? (
                                        <div className="text-center py-8 text-[#71717A] border border-dashed border-[#E8E2D5] rounded-lg">
                                            <Loader2 className="animate-spin mx-auto mb-2" />
                                            Loading active sessions...
                                        </div>
                                    ) : (
                                        sessions.map((session) => {
                                            const isCurrent = session.id === currentSessionId;
                                            const isMobile = /mobile/i.test(session.device_info || '');

                                            let browser = 'Unknown Browser';
                                            if (session.device_info?.includes('Chrome')) browser = 'Chrome';
                                            else if (session.device_info?.includes('Firefox')) browser = 'Firefox';
                                            else if (session.device_info?.includes('Safari') && !session.device_info?.includes('Chrome')) browser = 'Safari';
                                            else if (session.device_info?.includes('Edg')) browser = 'Edge';

                                            return (
                                                <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isCurrent ? 'bg-amber-50/60 border-[#966E2E]/40' : 'bg-[#FAF9F5] border-[#E8E2D5] hover:border-[#966E2E]'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-lg ${isCurrent ? 'bg-[#966E2E]/10 text-[#966E2E]' : 'bg-white border border-[#E8E2D5] text-[#71717A]'}`}>
                                                            <Monitor size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-[#18181B] text-sm">
                                                                    {browser} on {isMobile ? 'Mobile' : 'Desktop'}
                                                                </h3>
                                                                {isCurrent && (
                                                                    <span className="bg-[#966E2E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CURRENT</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-[#71717A] mt-1 font-mono">
                                                                IP: {session.ip_address} • Last active: {new Date(session.last_active).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRevokeSession(session.id)}
                                                        className="p-2 text-[#71717A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
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

                    {/* AI Assistant Configuration */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-white border border-[#E8E2D5] rounded-xl p-6 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#966E2E] rounded-xl text-white shadow-sm">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[#18181B]">Personal AI Assistant Setup</h2>
                                            <p className="text-xs text-[#71717A]">Configure Google Gemini LLM and administrative capabilities for your store.</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#966E2E]/10 text-[#966E2E] border border-[#966E2E]/20">
                                        Admin Copilot
                                    </span>
                                </div>

                                <div className="h-px bg-[#E8E2D5] w-full"></div>

                                {/* Gemini API Key */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-[#52525B] flex items-center gap-2">
                                            <Key size={16} className="text-[#966E2E]" />
                                            Google Gemini API Key
                                        </label>
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-[#966E2E] hover:underline"
                                        >
                                            Get Free Gemini API Key →
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={adminSettings.geminiApiKey || ''}
                                            onChange={(e) => updateAdminSettings({ geminiApiKey: e.target.value })}
                                            placeholder="AIzaSy..."
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors pr-12 font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B]"
                                        >
                                            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#71717A]">
                                        The assistant will use this key to generate responses and execute commands. If left blank, the assistant automatically uses the built-in deterministic command engine and any <code className="text-[#52525B]">GEMINI_API_KEY</code> set in <code className="text-[#52525B]">.env.local</code>.
                                    </p>
                                </div>

                                {/* AI Model Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#52525B] flex items-center gap-2">
                                        <Bot size={16} className="text-[#966E2E]" />
                                        Preferred Gemini Model
                                    </label>
                                    <select
                                        value={adminSettings.aiModel || 'gemini-2.5-flash'}
                                        onChange={(e) => updateAdminSettings({ aiModel: e.target.value })}
                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors"
                                    >
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & Most Accurate)</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight & Low Latency)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Complex Reasoning)</option>
                                    </select>
                                </div>

                                {/* Custom Assistant Prompt */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#52525B]">
                                        Custom Instructions / Store Directives (Optional)
                                    </label>
                                    <textarea
                                        value={adminSettings.aiCustomInstructions || ''}
                                        onChange={(e) => updateAdminSettings({ aiCustomInstructions: e.target.value })}
                                        placeholder="e.g. Always suggest 15% discount for wholesale inquiries. Our priority warehouse is Maliwara, Chandni Chowk."
                                        rows={3}
                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg p-3 text-[#18181B] focus:border-[#966E2E] outline-none transition-colors resize-none text-sm"
                                    />
                                    <p className="text-xs text-[#71717A]">
                                        Special guidelines or preferences for the AI when analyzing sales, calculating quotes, or formulating responses.
                                    </p>
                                </div>

                                <div className="h-px bg-[#E8E2D5] w-full"></div>

                                {/* Test Connection & Save */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleTestAi}
                                            disabled={testAiLoading}
                                            className="px-4 py-2.5 bg-[#FAF9F5] hover:bg-[#F3EFE6] text-[#18181B] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer border border-[#E8E2D5] disabled:opacity-50"
                                        >
                                            {testAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-[#966E2E]" />}
                                            Test AI Connection
                                        </button>
                                        {testAiResult && (
                                            <span className="text-xs text-[#52525B] font-mono">
                                                {testAiResult}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSaveSettings}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Save AI Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'danger' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-rose-600">
                                    <ShieldCheck size={24} /> Danger Zone
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-[#18181B]">Reset Database</h3>
                                            <p className="text-xs text-rose-600/80">Permanently delete all products, orders, and customer data. This action is irreversible.</p>
                                        </div>
                                        <button
                                            className="text-sm bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
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
