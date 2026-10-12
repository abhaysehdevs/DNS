'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Save, Globe, Trash2, ShieldCheck, Database, Bell, ShoppingBag, 
    Upload, Download, Loader2, LogOut, AlertCircle, Sparkles, Bot, 
    CheckCircle2, RefreshCw, X, FileText, Check, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

// Indian GSTIN validation regex
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function SettingsPage() {
    const { adminSettings, updateAdminSettings } = useAppStore();

    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // AI Status State
    const [aiServerConfigured, setAiServerConfigured] = useState<boolean | null>(null);
    const [testAiLoading, setTestAiLoading] = useState(false);
    const [testAiResult, setTestAiResult] = useState<string | null>(null);

    // Save Feedback & Validation States
    const [savedStatus, setSavedStatus] = useState<'clean' | 'dirty' | 'saved'>('clean');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [saveToast, setSaveToast] = useState<string | null>(null);

    // Import Dialog State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importPreview, setImportPreview] = useState<{ products: any[]; orders: any[]; rawData?: any } | null>(null);
    const [importTypedConfirm, setImportTypedConfirm] = useState('');
    const [importError, setImportError] = useState<string | null>(null);

    // Danger Zone Modal State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTypedConfirm, setResetTypedConfirm] = useState('');

    useEffect(() => {
        loadSettings();
        checkAiStatus();
    }, []);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSessions();
            if (typeof window !== 'undefined') {
                setCurrentSessionId(localStorage.getItem('admin_session_id'));
            }
        }
    }, [activeTab]);

    const checkAiStatus = async () => {
        try {
            const res = await fetch('/api/admin/ai/status');
            if (res.ok) {
                const data = await res.json();
                setAiServerConfigured(Boolean(data.configured));
            }
        } catch (e) {
            console.error('Failed to check AI status', e);
        }
    };

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('settings')
                .eq('key', 'global')
                .single();
            if (!error && data?.settings) {
                updateAdminSettings(data.settings);
                setSavedStatus('clean');
            }
        } catch (err) {
            console.error('Error loading settings from DB:', err);
        }
    };

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await fetch('/api/admin/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions || []);
            }
        } catch (err) {
            console.error('Error fetching admin sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleRevokeSession = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this session? The device will be logged out.')) return;

        try {
            const res = await fetch('/api/admin/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: id })
            });

            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== id));
                if (id === currentSessionId) {
                    alert('You have revoked your current session. Redirecting to login.');
                    window.location.reload();
                }
            } else {
                const err = await res.json();
                alert('Failed to revoke session: ' + (err.error || 'Unknown error'));
            }
        } catch (err: any) {
            alert('Failed to revoke session: ' + err.message);
        }
    };

    const handleSignOutAllOtherDevices = async () => {
        if (!currentSessionId) {
            alert('Current session identifier not found.');
            return;
        }

        if (!confirm('Sign out all other logged-in devices? Only this browser terminal will stay active.')) return;

        try {
            const res = await fetch('/api/admin/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ revokeAllOthers: true, currentSessionId })
            });

            if (res.ok) {
                alert('All other devices have been signed out successfully.');
                fetchSessions();
            }
        } catch (e: any) {
            alert('Failed: ' + e.message);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'store', label: 'Store Info & Tax', icon: ShoppingBag },
        { id: 'ai', label: 'AI Assistant Safeguards', icon: Sparkles },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'data', label: 'Data & Backup', icon: Database },
        { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
        { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
    ];

    // Validation
    const validateSettings = () => {
        const errors: Record<string, string> = {};

        // GSTIN Validation
        if (adminSettings.taxId && adminSettings.taxId.trim() !== '') {
            const cleanGst = adminSettings.taxId.trim().toUpperCase();
            if (!GSTIN_REGEX.test(cleanGst)) {
                errors.taxId = 'Invalid GSTIN format. Must be 15 alphanumeric characters (e.g. 07AAAAA0000A1Z5).';
            }
        }

        // Tax Rate Validation
        if (adminSettings.taxRate !== undefined) {
            const rate = Number(adminSettings.taxRate);
            if (isNaN(rate) || rate < 0 || rate > 100) {
                errors.taxRate = 'Tax rate must be between 0% and 100%.';
            }
        }

        // Social Links URL Validation
        if (adminSettings.socialLinks) {
            for (const [net, url] of Object.entries(adminSettings.socialLinks)) {
                if (url && typeof url === 'string' && url.trim() !== '') {
                    try {
                        new URL(url);
                    } catch {
                        errors[`social_${net}`] = `Invalid URL format for ${net}. Must start with http:// or https://.`;
                    }
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveSettings = async () => {
        if (!validateSettings()) {
            alert('Please resolve the validation errors highlighted in the form.');
            return;
        }

        setLoading(true);
        try {
            // Strip any sensitive client keys before persisting to site_settings table
            const sanitizedSettings = { ...adminSettings };
            delete (sanitizedSettings as any).geminiApiKey;

            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'global',
                    settings: sanitizedSettings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Log to audit log
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';
            fetch('/api/admin/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: adminEmail,
                    action: 'SETTINGS_UPDATE',
                    resourceType: 'SETTINGS',
                    details: { updatedKeys: Object.keys(sanitizedSettings) }
                })
            }).catch(() => {});

            setSavedStatus('saved');
            setSaveToast('Settings saved successfully!');
            setTimeout(() => setSaveToast(null), 3500);
        } catch (error: any) {
            alert('Error saving settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                    messages: [{ role: 'user', content: 'Respond with "DNS AI Server Connection Verified OK."' }]
                })
            });
            const data = await res.json();
            if (res.ok) {
                setTestAiResult(`✅ Success: ${data.reply}`);
                setAiServerConfigured(true);
            } else {
                setTestAiResult(`❌ Error: ${data.error || 'Failed to connect to Gemini API'}`);
            }
        } catch (err: any) {
            setTestAiResult(`❌ Connection error: ${err.message}`);
        } finally {
            setTestAiLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const { data: products } = await supabase.from('products').select('*');
            const { data: categories } = await supabase.from('categories').select('*');
            const { data: orders } = await supabase.from('orders').select('*');

            const backup = {
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                store: adminSettings.storeName,
                categories: categories || [],
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

    // File selection for Import
    const handleFileSelectForImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError(null);
        try {
            const text = await file.text();
            if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(text);
                const productsList = Array.isArray(parsed.products) ? parsed.products : (Array.isArray(parsed) ? parsed : []);
                const ordersList = Array.isArray(parsed.orders) ? parsed.orders : [];
                setImportPreview({
                    products: productsList,
                    orders: ordersList,
                    rawData: parsed
                });
                setShowImportModal(true);
            } else if (file.name.endsWith('.csv')) {
                // Parse CSV rows
                const lines = text.split('\n').filter(l => l.trim() !== '');
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const productsFromCsv: any[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj: any = {};
                    headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
                    if (obj.Name || obj.name) {
                        productsFromCsv.push({
                            name: obj.Name || obj.name,
                            sku: obj.SKU || obj.sku || `DNS-${Math.floor(1000 + Math.random() * 9000)}`,
                            quantity: Number(obj.Stock || obj.quantity || 10),
                            retail_price: Number(obj.Price || obj.retail_price || 0),
                            category: obj.Category || obj.category || 'Tools',
                            slug: obj.Slug || obj.slug || ''
                        });
                    }
                }
                setImportPreview({
                    products: productsFromCsv,
                    orders: []
                });
                setShowImportModal(true);
            } else {
                alert('Please upload a .json or .csv backup file.');
            }
        } catch (err: any) {
            setImportError('Failed to parse file: ' + err.message);
        }
    };

    const handleExecuteImport = async () => {
        if (importTypedConfirm !== 'IMPORT') {
            alert('Please type "IMPORT" to authorize restoring this data.');
            return;
        }

        if (!importPreview || importPreview.products.length === 0) {
            alert('No valid products found in this import file.');
            return;
        }

        setImportLoading(true);
        try {
            // Upsert products additive without dropping existing catalog
            const productsToInsert = importPreview.products.map(p => ({
                name: p.name,
                category: p.category || 'Tools',
                retail_price: Number(p.retail_price) || 0,
                wholesale_price: Number(p.wholesale_price) || 0,
                quantity: Number(p.quantity) || 10,
                in_stock: p.in_stock !== false,
                sku: p.sku || `DNS-${Math.floor(1000 + Math.random() * 9000)}`,
                slug: p.slug || `${(p.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`,
                meta_title: p.meta_title || p.seo_title || '',
                meta_description: p.meta_description || p.seo_description || '',
                meta_keywords: p.meta_keywords || p.seo_keywords || '',
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('products')
                .upsert(productsToInsert, { onConflict: 'sku' });

            if (error) throw error;

            // Log import to audit log
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';
            await fetch('/api/admin/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: adminEmail,
                    action: 'DATA_IMPORT_RESTORE',
                    resourceType: 'IMPORT',
                    details: { importedProductsCount: productsToInsert.length }
                })
            });

            alert(`✅ Successfully imported and updated ${productsToInsert.length} products!`);
            setShowImportModal(false);
            setImportPreview(null);
            setImportTypedConfirm('');
        } catch (err: any) {
            alert('Import failed: ' + err.message);
        } finally {
            setImportLoading(false);
        }
    };

    const handleExecuteReset = async () => {
        if (resetTypedConfirm !== 'CONFIRM RESET') {
            alert('Please type "CONFIRM RESET" to proceed.');
            return;
        }

        setResetLoading(true);
        try {
            // Delete child order items then orders
            await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Log reset to audit log
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';
            await fetch('/api/admin/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: adminEmail,
                    action: 'DANGER_RESET_DATABASE',
                    resourceType: 'DATABASE',
                    details: { clearedTables: ['products', 'orders', 'order_items'] }
                })
            });

            alert('Database tables cleared. Please reload or seed catalog data.');
            setShowResetModal(false);
            setResetTypedConfirm('');
            window.location.reload();
        } catch (error: any) {
            alert('Error clearing database: ' + error.message);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto min-h-screen text-[#18181B] pb-20 p-4">
            
            {/* Success Toast */}
            {saveToast && (
                <div className="fixed top-6 right-6 z-[200] bg-emerald-700 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-bold tracking-wide">{saveToast}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#18181B] mb-1">Settings</h1>
                    <p className="text-[#71717A] text-sm">Manage store configuration, compliance, AI policies & security.</p>
                </div>
                <div className="flex items-center gap-3">
                    {savedStatus === 'saved' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                            <Check size={13} /> Synced with Database
                        </span>
                    ) : savedStatus === 'dirty' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5">
                            <AlertTriangle size={13} /> Unsaved Changes
                        </span>
                    ) : null}

                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="bg-[#966E2E] hover:bg-[#7D5A25] text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Settings
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white border border-[#E8E2D5] rounded-2xl overflow-hidden sticky top-24 shadow-xs">
                        <nav className="flex flex-col p-2 space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id
                                        ? 'bg-[#966E2E] text-white shadow-xs'
                                        : 'text-[#52525B] hover:bg-[#FAF9F5] hover:text-[#18181B]'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-[#E8E2D5] mt-2">
                            <div className="text-[10px] text-[#71717A] text-center font-mono">
                                Admin Core v2.0 • Phase 1
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-xs">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <Globe className="text-[#966E2E]" size={24} /> General Store Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B]">Store Display Name</label>
                                        <input
                                            type="text"
                                            value={adminSettings.storeName || ''}
                                            onChange={(e) => {
                                                updateAdminSettings({ storeName: e.target.value });
                                                setSavedStatus('dirty');
                                            }}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-[#18181B] focus:border-[#966E2E] outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B]">Default Currency</label>
                                        <select
                                            value={adminSettings.currency || 'INR'}
                                            onChange={(e) => {
                                                updateAdminSettings({ currency: e.target.value });
                                                setSavedStatus('dirty');
                                            }}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-[#18181B] focus:border-[#966E2E] outline-none"
                                        >
                                            <option value="INR">INR (₹) - Indian Rupee</option>
                                            <option value="USD">USD ($) - US Dollar</option>
                                            <option value="EUR">EUR (€) - Euro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Store Info & Tax (1.5 Validation & Confirmation) */}
                    {activeTab === 'store' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-xs space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-[#18181B]">
                                    <ShoppingBag className="text-emerald-600" size={24} /> Tax Compliance & Store Identity
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tax ID (GSTIN) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B] flex justify-between">
                                            <span>GSTIN (Goods and Services Tax ID)</span>
                                            <span className="text-[10px] text-[#71717A] uppercase">15 Chars (India)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={adminSettings.taxId || ''}
                                            onChange={(e) => {
                                                updateAdminSettings({ taxId: e.target.value.toUpperCase() });
                                                setSavedStatus('dirty');
                                            }}
                                            placeholder="e.g. 07AAAAA0000A1Z5"
                                            maxLength={15}
                                            className={`w-full bg-[#FAF9F5] border rounded-xl p-3 text-[#18181B] focus:border-[#966E2E] outline-none font-mono ${
                                                validationErrors.taxId ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                                            }`}
                                        />
                                        {validationErrors.taxId && (
                                            <p className="text-xs text-rose-600">{validationErrors.taxId}</p>
                                        )}
                                    </div>

                                    {/* Tax Rate */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#52525B]">Default Tax / GST Rate (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={adminSettings.taxRate ?? 18}
                                                onChange={(e) => {
                                                    updateAdminSettings({ taxRate: Number(e.target.value) });
                                                    setSavedStatus('dirty');
                                                }}
                                                className={`w-full bg-[#FAF9F5] border rounded-xl p-3 text-[#18181B] focus:border-[#966E2E] outline-none ${
                                                    validationErrors.taxRate ? 'border-rose-400 bg-rose-50/50' : 'border-[#E8E2D5]'
                                                }`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] font-bold">%</span>
                                        </div>
                                        {validationErrors.taxRate && (
                                            <p className="text-xs text-rose-600">{validationErrors.taxRate}</p>
                                        )}
                                    </div>

                                    {/* Legal Entity Name */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-[#52525B]">Legal Business Entity Name</label>
                                        <input
                                            type="text"
                                            value={adminSettings.legalBusinessName || ''}
                                            onChange={(e) => {
                                                updateAdminSettings({ legalBusinessName: e.target.value });
                                                setSavedStatus('dirty');
                                            }}
                                            placeholder="e.g. Dinanath & Sons Jewellery Machinery Private Limited"
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-[#18181B] focus:border-[#966E2E] outline-none"
                                        />
                                    </div>

                                    {/* Shipping Origin Address */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-[#52525B]">Shipping Origin & Dispatch Warehouse</label>
                                        <textarea
                                            value={adminSettings.shippingOrigin || ''}
                                            onChange={(e) => {
                                                updateAdminSettings({ shippingOrigin: e.target.value });
                                                setSavedStatus('dirty');
                                            }}
                                            placeholder="1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006"
                                            rows={2}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-[#18181B] focus:border-[#966E2E] outline-none resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Social Links with Validation */}
                                <div className="border-t border-[#E8E2D5] pt-6 space-y-4">
                                    <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">Social Channels & Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['facebook', 'instagram', 'twitter', 'linkedin'].map((net) => (
                                            <div key={net} className="space-y-1">
                                                <label className="text-xs font-medium text-[#52525B] capitalize">{net} URL</label>
                                                <input
                                                    type="url"
                                                    value={(adminSettings.socialLinks as any)?.[net] || ''}
                                                    onChange={(e) => {
                                                        updateAdminSettings({
                                                            socialLinks: { ...(adminSettings.socialLinks || {}), [net]: e.target.value }
                                                        });
                                                        setSavedStatus('dirty');
                                                    }}
                                                    placeholder={`https://${net}.com/...`}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B] focus:border-[#966E2E] outline-none"
                                                />
                                                {validationErrors[`social_${net}`] && (
                                                    <p className="text-[10px] text-rose-600">{validationErrors[`social_${net}`]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Assistant Safeguards (1.7 Fixes) */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-xs space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-[#966E2E] rounded-xl text-white shadow-xs">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[#18181B]">AI Copilot Governance & Safeguards</h2>
                                            <p className="text-xs text-[#71717A]">Strict secret isolation, confirmation checks, and operational rate limits.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-[#E8E2D5] w-full"></div>

                                {/* Security Indicator (Rule 5 & Prompt 1.7) */}
                                <div className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FAF9F5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-bold text-[#18181B] flex items-center gap-2">
                                            <ShieldCheck size={16} className={aiServerConfigured ? "text-emerald-600" : "text-amber-600"} />
                                            Server Environment Key Status:
                                            {aiServerConfigured ? (
                                                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200">
                                                    Configured in .env.local (Protected)
                                                </span>
                                            ) : (
                                                <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px] border border-amber-200">
                                                    GEMINI_API_KEY Missing on Server
                                                </span>
                                            )}
                                        </span>
                                        <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                                            Per strict security rules, third-party API secrets are never exposed in client forms or stored in readable browser database tables. The key is managed exclusively on the backend.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleTestAi}
                                        disabled={testAiLoading}
                                        className="px-4 py-2 bg-white border border-[#E8E2D5] hover:bg-[#FAF9F5] text-[#18181B] rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2"
                                    >
                                        {testAiLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                        Test Server Connection
                                    </button>
                                </div>

                                {testAiResult && (
                                    <div className="p-3 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl text-xs font-mono text-[#52525B]">
                                        {testAiResult}
                                    </div>
                                )}

                                {/* Safeguard Switches */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                        <div>
                                            <h4 className="font-bold text-xs text-[#18181B]">Disable AI Write Actions</h4>
                                            <p className="text-[10px] text-[#71717A]">
                                                When enabled, the assistant is restricted to read-only queries (summaries, searching) and cannot stage or execute any database changes.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(adminSettings.disableAiWrites)}
                                                onChange={e => {
                                                    updateAdminSettings({ disableAiWrites: e.target.checked });
                                                    setSavedStatus('dirty');
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                        <div>
                                            <h4 className="font-bold text-xs text-[#18181B]">Enforce Confirmation Cards for All Mutations</h4>
                                            <p className="text-[10px] text-[#71717A]">
                                                Every create, update, or status change must render a before/after confirmation card and await human click. (Always active by default).
                                            </p>
                                        </div>
                                        <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-xs">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <Bell className="text-[#966E2E]" size={24} /> Notification Preferences
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#966E2E]/10 rounded-lg text-[#966E2E]"><Bell size={20} /></div>
                                            <div>
                                                <h3 className="font-medium text-[#18181B]">Order Confirmation Emails</h3>
                                                <p className="text-xs text-[#71717A]">Receive emails whenever a customer places an order.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(adminSettings.emailNotifications)}
                                                onChange={e => {
                                                    updateAdminSettings({ emailNotifications: e.target.checked });
                                                    setSavedStatus('dirty');
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#966E2E]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data & Backup (1.5 Import Feature Built) */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-xs">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#18181B]">
                                    <Database className="text-[#966E2E]" size={24} /> Data Backup & Migration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border border-[#E8E2D5] rounded-2xl bg-[#FAF9F5] space-y-4">
                                        <Download className="text-[#966E2E]" size={32} />
                                        <h3 className="text-lg font-bold text-[#18181B]">Export Store Backup</h3>
                                        <p className="text-xs text-[#71717A] leading-relaxed">
                                            Download a complete JSON backup containing all product catalog rows, categories, and order history without secret credentials.
                                        </p>
                                        <button
                                            onClick={handleExportData}
                                            className="w-full py-2.5 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
                                        >
                                            Download Backup JSON
                                        </button>
                                    </div>

                                    <div className="p-6 border border-[#E8E2D5] rounded-2xl bg-[#FAF9F5] space-y-4">
                                        <Upload className="text-emerald-600" size={32} />
                                        <h3 className="text-lg font-bold text-[#18181B]">Import / Restore Data</h3>
                                        <p className="text-xs text-[#71717A] leading-relaxed">
                                            Upload a previous JSON backup or inventory CSV to import products. A verification preview with typed confirmation is required before changes are applied.
                                        </p>
                                        <label className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer">
                                            Select Backup File (.JSON / .CSV)
                                            <input type="file" accept=".json,.csv" onChange={handleFileSelectForImport} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security & Sessions (1.4 & 1.5 Active Sessions Built) */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-xs space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-[#18181B]">
                                            <ShieldCheck className="text-emerald-600" size={24} /> Active Operator Terminals
                                        </h2>
                                        <p className="text-xs text-[#71717A] mt-1">
                                            Monitor live operator sessions with verified client IP addresses and geographical locations.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={fetchSessions}
                                            disabled={sessionsLoading}
                                            className="p-2 border border-[#E8E2D5] hover:bg-[#FAF9F5] rounded-xl text-[#71717A]"
                                            title="Refresh Sessions"
                                        >
                                            <RefreshCw size={16} className={sessionsLoading ? "animate-spin" : ""} />
                                        </button>
                                        <button
                                            onClick={handleSignOutAllOtherDevices}
                                            className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold"
                                        >
                                            Sign Out Other Devices
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {sessionsLoading ? (
                                        <div className="text-center py-12 text-[#71717A] border border-dashed border-[#E8E2D5] rounded-2xl">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-[#966E2E]" size={24} />
                                            Loading operator sessions...
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div className="text-center py-12 text-[#71717A] border border-dashed border-[#E8E2D5] rounded-2xl text-xs">
                                            No active operator sessions found in registry.
                                        </div>
                                    ) : (
                                        sessions.map((session) => {
                                            const isCurrent = session.id === currentSessionId;
                                            return (
                                                <div 
                                                    key={session.id} 
                                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                                        isCurrent ? 'bg-amber-50/70 border-[#966E2E]/40' : 'bg-[#FAF9F5] border-[#E8E2D5]'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-xs text-[#18181B] truncate">
                                                                {session.browser || 'Browser'} on {session.os || 'OS'} ({session.device_info || 'Terminal'})
                                                            </h4>
                                                            {isCurrent && (
                                                                <span className="bg-[#966E2E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                                    This Device
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-[#71717A] font-mono mt-1">
                                                            IP: <span className="text-[#18181B] font-bold">{session.ip_address || '127.0.0.1'}</span> • Location: {session.city ? `${session.city}, ` : ''}{session.country || 'India'} • Last active: {new Date(session.last_active).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {!isCurrent && (
                                                        <button
                                                            onClick={() => handleRevokeSession(session.id)}
                                                            className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 font-bold shrink-0"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone (1.7b Typed Confirmation & Log Entry) */}
                    {activeTab === 'danger' && (
                        <div className="space-y-6">
                            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-xs space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-rose-600">
                                    <AlertCircle size={24} /> Danger Zone: Irreversible Actions
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-rose-200">
                                        <div>
                                            <h3 className="font-bold text-sm text-[#18181B]">Purge Store Database</h3>
                                            <p className="text-xs text-rose-700 mt-0.5">
                                                Permanently deletes all products, orders, and line items. Requires typed operator authorization.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowResetModal(true)}
                                            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
                                        >
                                            Reset Catalog Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- Data Import Modal (1.5) --- */}
            {showImportModal && importPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                    <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-[#E8E2D5] pb-4">
                            <h3 className="text-lg font-bold text-[#18181B] flex items-center gap-2">
                                <Upload size={20} className="text-emerald-600" /> Confirm Data Import
                            </h3>
                            <button onClick={() => setShowImportModal(false)} className="text-[#71717A] hover:text-[#18181B]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-2xl border border-[#E8E2D5] text-xs">
                            <p className="font-bold text-[#18181B]">Import Payload Summary:</p>
                            <p>• Products detected: <strong className="text-emerald-700">{importPreview.products.length}</strong> items</p>
                            {importPreview.orders.length > 0 && (
                                <p>• Orders detected: <strong>{importPreview.orders.length}</strong> items</p>
                            )}
                            <p className="text-[11px] text-[#71717A] mt-2">
                                Note: This will add new products or update matching products by SKU without deleting any existing data.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#18181B] block">
                                Type <code className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">IMPORT</code> to authorize:
                            </label>
                            <input
                                type="text"
                                value={importTypedConfirm}
                                onChange={e => setImportTypedConfirm(e.target.value)}
                                placeholder="IMPORT"
                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-xs font-mono font-bold"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-5 py-2.5 border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#71717A] hover:bg-[#FAF9F5]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecuteImport}
                                disabled={importLoading || importTypedConfirm !== 'IMPORT'}
                                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-2"
                            >
                                {importLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                Apply Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Reset Database Modal (1.7b) --- */}
            {showResetModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                    <div className="bg-white border border-rose-300 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-rose-200 pb-4">
                            <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                                <AlertTriangle size={20} /> Dangerous Database Reset
                            </h3>
                            <button onClick={() => setShowResetModal(false)} className="text-[#71717A] hover:text-[#18181B]">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-xs text-rose-800 leading-relaxed bg-rose-50 p-4 rounded-2xl border border-rose-200">
                            This action will permanently delete all records in products, orders, and order_items. This action CANNOT be undone and will be logged to the audit trail with your IP address.
                        </p>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#18181B] block">
                                Type <code className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200">CONFIRM RESET</code> to authorize:
                            </label>
                            <input
                                type="text"
                                value={resetTypedConfirm}
                                onChange={e => setResetTypedConfirm(e.target.value)}
                                placeholder="CONFIRM RESET"
                                className="w-full bg-[#FAF9F5] border border-rose-300 rounded-xl p-3 text-xs font-mono font-bold"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="px-5 py-2.5 border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#71717A] hover:bg-[#FAF9F5]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecuteReset}
                                disabled={resetLoading || resetTypedConfirm !== 'CONFIRM RESET'}
                                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-2"
                            >
                                {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Erase All Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
