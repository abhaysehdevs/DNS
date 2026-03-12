
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { Search, Mail, Phone, ShoppingBag, Calendar, User, FileText, Plus, X, Trash2, Edit2, AlertCircle, Save, Clock, ChevronDown, ChevronUp, History, Tag, Activity, MessageSquare, CheckCircle, Ban, ArrowRight, MoreHorizontal } from 'lucide-react';
import { type Product } from '@/lib/data';

interface Customer {
    id: string; // pseudo-id
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    type: 'Retail' | 'Wholesale';
    isManual?: boolean;
    notes?: string;
    // Enhanced Fields
    status: 'Lead' | 'Active' | 'Inactive' | 'Blocked';
    tags: string[];
    nextFollowUpDate?: string;
}

export default function CustomersPage() {
    const {
        customerQuotes,
        addCustomerQuote,
        updateCustomerQuote,
        deleteCustomerQuote,
        manualCustomers,
        addManualCustomer,
        updateManualCustomer,
        deleteManualCustomer,
        customerActivities,
        addCustomerActivity,
        deleteCustomerActivity
    } = useAppStore();

    // Data State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<any[]>([]); // Using any[] to match Supabase snake_case return
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Detail View State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'quotes' | 'activity'>('profile');

    // Forms State
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

    // New Quote State
    const [quoteForm, setQuoteForm] = useState({
        productId: '',
        productName: '',
        quotedPrice: '',
        notes: ''
    });

    // New Activity State
    const [newActivity, setNewActivity] = useState({
        type: 'Call' as const,
        summary: '',
        details: ''
    });

    // New Customer State
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'Wholesale' as const,
        status: 'Lead' as const,
        notes: '',
        tags: '' // manual input as string
    });

    // Status Options
    const statusColors = {
        'Lead': 'bg-blue-500',
        'Active': 'bg-green-500',
        'Inactive': 'bg-gray-500',
        'Blocked': 'bg-red-500'
    };

    useEffect(() => {
        fetchData();
    }, [manualCustomers]);

    async function fetchData() {
        setLoading(true);

        // 1. Fetch Orders for Derived Customers
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // 2. Fetch Products
        const { data: productsData } = await supabase
            .from('products')
            .select('*');
        if (productsData) setProducts(productsData as any);

        // 3. Process Customers
        const customerMap = new Map<string, Customer>();

        // Add Manual Customers first
        manualCustomers.forEach(mc => {
            customerMap.set(mc.id, {
                id: mc.id,
                name: mc.name,
                email: mc.email,
                phone: mc.phone,
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: mc.createdAt,
                type: mc.type,
                isManual: true,
                notes: mc.notes,
                status: mc.status || 'Active',
                tags: mc.tags || [],
                nextFollowUpDate: mc.nextFollowUpDate
            });
        });

        // Merge Order-based Customers
        if (orders) {
            orders.forEach((order: any) => {
                const key = order.customer_email || order.customer_phone;
                if (!key) return;

                let existingId = Array.from(customerMap.keys()).find(k => k === key || customerMap.get(k)?.email === key);

                if (!existingId) {
                    if (!customerMap.has(key)) {
                        customerMap.set(key, {
                            id: key,
                            name: order.customer_name || 'Guest',
                            email: order.customer_email || '',
                            phone: order.customer_phone || '',
                            totalOrders: 0,
                            totalSpent: 0,
                            lastOrderDate: order.created_at,
                            type: 'Retail',
                            status: 'Active',
                            tags: ['Online'],
                            nextFollowUpDate: undefined
                        });
                    }
                    existingId = key;
                }

                const customer = customerMap.get(existingId!)!;
                customer.totalOrders += 1;
                customer.totalSpent += order.total_amount || 0;

                if (!customer.isManual && customer.totalSpent > 15000) {
                    customer.type = 'Wholesale';
                }

                if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
                    customer.lastOrderDate = order.created_at;
                }
            });
        }

        setCustomers(Array.from(customerMap.values()));
        setLoading(false);
    }

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm);
        const matchesType = filterType === 'All' || c.type === filterType;
        return matchesSearch && matchesType;
    });

    // --- Actions ---

    const handleSaveQuote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        const selectedProduct = products.find(p => p.id === quoteForm.productId);

        const quoteData = {
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.name,
            productId: quoteForm.productId,
            productName: selectedProduct ? selectedProduct.name : quoteForm.productName,
            quotedPrice: parseFloat(quoteForm.quotedPrice),
            notes: quoteForm.notes,
            date: new Date().toISOString(),
            retailPriceSnapshot: selectedProduct?.retail_price,
            wholesalePriceSnapshot: selectedProduct?.wholesale_price
        };

        if (editingQuoteId) {
            updateCustomerQuote(editingQuoteId, quoteData);
        } else {
            addCustomerQuote(quoteData);
            // Log this activity
            addCustomerActivity({
                customerId: selectedCustomer.id,
                type: 'Note',
                summary: 'Price Quote Given',
                details: `Quoted ₹${quoteData.quotedPrice} for ${quoteData.productName}`,
                date: new Date().toISOString()
            });
        }

        resetQuoteForm();
    };

    const handleEditQuote = (quote: any) => {
        setQuoteForm({
            productId: quote.productId || '',
            productName: quote.productName,
            quotedPrice: quote.quotedPrice.toString(),
            notes: quote.notes
        });
        setEditingQuoteId(quote.id);
        setShowQuoteForm(true);
    };

    const resetQuoteForm = () => {
        setQuoteForm({ productId: '', productName: '', quotedPrice: '', notes: '' });
        setEditingQuoteId(null);
        setShowQuoteForm(false);
    };

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        const tags = newCustomer.tags.split(',').map(t => t.trim()).filter(t => t);
        addManualCustomer({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...newCustomer,
            tags
        });
        setNewCustomer({ name: '', email: '', phone: '', type: 'Wholesale', status: 'Lead', notes: '', tags: '' });
        setShowCustomerForm(false);
    };

    const handleUpdateStatus = (status: any) => {
        if (!selectedCustomer) return;
        if (selectedCustomer.isManual) {
            updateManualCustomer(selectedCustomer.id, { status });
            setSelectedCustomer({ ...selectedCustomer, status });
            // Log Status Change
            addCustomerActivity({
                customerId: selectedCustomer.id,
                type: 'Note',
                summary: `Status updated to ${status}`,
                date: new Date().toISOString()
            });
        } else {
            alert('Status updates only supported for manually added CRM customers currently.');
        }
    };

    const handleUpdateFollowUp = (date: string) => {
        if (!selectedCustomer || !selectedCustomer.isManual) return;
        updateManualCustomer(selectedCustomer.id, { nextFollowUpDate: date });
        setSelectedCustomer({ ...selectedCustomer, nextFollowUpDate: date });
    };

    const handleAddActivity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        addCustomerActivity({
            customerId: selectedCustomer.id,
            type: newActivity.type as any,
            summary: newActivity.summary,
            details: newActivity.details,
            date: new Date().toISOString()
        });
        setNewActivity({ type: 'Call', summary: '', details: '' });
    };

    const handleDeleteCustomer = (id: string, isManual?: boolean) => {
        if (!confirm('Are you sure? This will remove the customer from the view.')) return;
        if (isManual) {
            deleteManualCustomer(id);
            setSelectedCustomer(null);
        } else {
            alert('Cannot delete customers with existing orders.');
        }
    };

    const getQuoteHistory = (customerId: string) => {
        const quotes = customerQuotes.filter(q => q.customerId === customerId);
        return quotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const getActivityLog = (customerId: string) => {
        const activities = customerActivities.filter(a => a.customerId === customerId);
        return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    return (
        <div className="min-h-screen text-gray-100 space-y-8 p-4">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 sticky top-20 z-10 shadow-lg">
                <div className="flex gap-4 w-full md:w-auto items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search CRM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer hover:bg-gray-750"
                    >
                        <option value="All">All Types</option>
                        <option value="Retail">Retail</option>
                        <option value="Wholesale">Wholesale</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCustomerForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={16} /> Add Lead / Customer
                    </button>
                </div>
            </div>

            {/* Customers Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-gray-900/50 rounded-xl animate-pulse border border-gray-800"></div>
                    ))}
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                    <User size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-400">No customers found</h3>
                    <p className="text-sm text-gray-600 mt-2">Try adding a new customer manually.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            onClick={() => { setSelectedCustomer(customer); setActiveTab('profile'); }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-900/10 cursor-pointer group relative overflow-hidden"
                        >
                            {/* Tags / Badges */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${customer.status === 'Active' ? 'bg-green-900/20 text-green-400 border-green-900/30' : customer.status === 'Lead' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors[customer.status] || 'bg-gray-500'}`}></span>
                                    {customer.status}
                                </div>
                                {customer.nextFollowUpDate && (
                                    <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-900/10 px-2 py-0.5 rounded-full">
                                        <Clock size={10} /> {new Date(customer.nextFollowUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg border ${customer.type === 'Wholesale' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' : 'bg-blue-900/20 text-blue-500 border-blue-900/30'}`}>
                                    {customer.name[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{customer.name}</h3>
                                    <span className="text-xs text-gray-500">{customer.type}</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-gray-500 flex-shrink-0" />
                                    <span>{customer.phone || 'N/A'}</span>
                                </div>
                                {customer.tags && customer.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {customer.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                                                {tag}
                                            </span>
                                        ))}
                                        {customer.tags.length > 3 && <span className="text-[10px] text-gray-600">+{customer.tags.length - 3}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Customer Modal */}
            {showCustomerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Add Prospect / Lead</h3>
                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400">Name</label>
                                <input
                                    required
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        value={newCustomer.email}
                                        onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Phone</label>
                                    <input
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Initial Status</label>
                                <select
                                    value={newCustomer.status}
                                    onChange={e => setNewCustomer({ ...newCustomer, status: e.target.value as any })}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-white"
                                >
                                    <option value="Lead">Lead - Prospect</option>
                                    <option value="Active">Active - Customer</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Tags (comma separated)</label>
                                <input
                                    value={newCustomer.tags}
                                    onChange={e => setNewCustomer({ ...newCustomer, tags: e.target.value })}
                                    placeholder="e.g. Construction, Urgent, Ref-123"
                                    className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCustomerForm(false)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Create Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Customer Details Full Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">

                        {/* Sidebar */}
                        <div className="w-full md:w-72 bg-gray-950/50 border-r border-gray-800 flex flex-col p-6 overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center font-bold text-3xl mb-3 border ${selectedCustomer.type === 'Wholesale' ? 'bg-amber-900/20 text-amber-500 border-amber-900/30' : 'bg-blue-900/20 text-blue-500 border-blue-900/30'}`}>
                                    {selectedCustomer.name[0]}
                                </div>
                                <h2 className="text-xl font-bold text-white break-words mb-1">{selectedCustomer.name}</h2>
                                {selectedCustomer.isManual && (
                                    <input
                                        type="date"
                                        className="text-xs bg-gray-900 border border-gray-800 rounded p-1 text-gray-400 w-full mt-2"
                                        value={selectedCustomer.nextFollowUpDate ? selectedCustomer.nextFollowUpDate.split('T')[0] : ''}
                                        onChange={(e) => handleUpdateFollowUp(e.target.value ? new Date(e.target.value).toISOString() : '')}
                                        title="Next Follow-up Date"
                                    />
                                )}
                            </div>

                            {/* Lifecycle Stage */}
                            {selectedCustomer.isManual && (
                                <div className="mb-6">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Stage Status</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCustomer.status}
                                            onChange={(e) => handleUpdateStatus(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-sm text-white appearance-none cursor-pointer hover:border-gray-700 focus:border-blue-500 outline-none"
                                        >
                                            <option value="Lead">Lead</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusColors[selectedCustomer.status] || 'bg-gray-500'} pointer-events-none`}></div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1 flex-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                                >
                                    <User size={18} /> Profile Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'activity' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                                >
                                    <Activity size={18} /> Interaction Log
                                </button>
                                <button
                                    onClick={() => setActiveTab('quotes')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quotes' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                                >
                                    <FileText size={18} /> Price Quotes
                                </button>
                            </div>

                            <button onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.isManual)} className="mt-6 flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-xs py-2 border border-red-900/30 hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col min-h-0 bg-gray-900/50">
                            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900">
                                <h3 className="font-bold text-lg text-white">
                                    {activeTab === 'profile' && 'Customer 360° View'}
                                    {activeTab === 'activity' && 'CRM Interaction Timeline'}
                                    {activeTab === 'quotes' && 'Quote Management'}
                                </h3>
                                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 relative">
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-800">
                                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Contact Details</h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between py-2 border-b border-gray-800/50">
                                                        <span className="text-gray-400 flex items-center gap-2"><Mail size={14} /> Email</span>
                                                        <span className="text-white font-medium">{selectedCustomer.email || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-800/50">
                                                        <span className="text-gray-400 flex items-center gap-2"><Phone size={14} /> Phone</span>
                                                        <span className="text-white font-medium">{selectedCustomer.phone || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-gray-400">Created</span>
                                                        <span className="text-white font-medium">{new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-800">
                                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Financial Overview</h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between py-2 border-b border-gray-800/50">
                                                        <span className="text-gray-400">Pipeline Value / Spent</span>
                                                        <span className="text-green-400 font-bold">₹{selectedCustomer.totalSpent.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-800/50">
                                                        <span className="text-gray-400">Orders / Deals</span>
                                                        <span className="text-blue-400 font-bold">{selectedCustomer.totalOrders}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tags Section */}
                                            {selectedCustomer.tags && (
                                                <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-800 md:col-span-2">
                                                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4 flex items-center gap-2">
                                                        <Tag size={14} /> Assigned Tags
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedCustomer.tags.length > 0 ? selectedCustomer.tags.map(tag => (
                                                            <span key={tag} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-full text-xs text-blue-300">
                                                                {tag}
                                                            </span>
                                                        )) : <span className="text-gray-500 text-sm italic">No tags assigned</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'activity' && (
                                    <div className="flex flex-col h-full">
                                        {/* New Activity Input */}
                                        <div className="bg-gray-800/30 border border-gray-800 p-4 rounded-xl mb-6 flex-shrink-0">
                                            <form onSubmit={handleAddActivity} className="space-y-3">
                                                <div className="flex gap-2">
                                                    <select
                                                        value={newActivity.type}
                                                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                                                        className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500 outline-none"
                                                    >
                                                        <option value="Call">Call</option>
                                                        <option value="Email">Email</option>
                                                        <option value="Meeting">Meeting</option>
                                                        <option value="Note">Note</option>
                                                    </select>
                                                    <input
                                                        required
                                                        placeholder="Summary (e.g. Discussed new inventory)"
                                                        value={newActivity.summary}
                                                        onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
                                                        className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                    />
                                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Log</button>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Timeline */}
                                        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                                            {getActivityLog(selectedCustomer.id).length === 0 ? (
                                                <div className="text-center text-gray-500 py-10">No activity recorded.</div>
                                            ) : (
                                                getActivityLog(selectedCustomer.id).map((activity) => (
                                                    <div key={activity.id} className="relative pl-6 border-l-2 border-gray-800 pb-2">
                                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-gray-900 ${activity.type === 'Call' ? 'bg-green-500' :
                                                            activity.type === 'Meeting' ? 'bg-purple-500' :
                                                                activity.type === 'Email' ? 'bg-blue-500' : 'bg-gray-500'
                                                            }`}></div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">{activity.type}</span>
                                                                <h4 className="text-white font-medium text-sm mt-0.5">{activity.summary}</h4>
                                                                {activity.details && <p className="text-gray-400 text-xs mt-1">{activity.details}</p>}
                                                            </div>
                                                            <span className="text-[10px] text-gray-600 whitespace-nowrap">{new Date(activity.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'quotes' && (
                                    <div className="space-y-6">
                                        {/* List Header */}
                                        <div className="flex justify-between items-center bg-gray-800/20 p-4 rounded-xl border border-gray-800/50">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Product Quotes</h4>
                                                <p className="text-xs text-gray-400">Track special pricing offered to {selectedCustomer.name}.</p>
                                            </div>
                                            <button
                                                onClick={() => { resetQuoteForm(); setShowQuoteForm(true); }}
                                                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                            >
                                                <Plus size={14} /> New Quote
                                            </button>
                                        </div>

                                        {/* Quote List */}
                                        <div className="space-y-4">
                                            {getQuoteHistory(selectedCustomer.id).length === 0 ? (
                                                <div className="text-center py-12 text-gray-500">
                                                    <History className="mx-auto mb-2 opacity-30" size={32} />
                                                    <p>No quote history available.</p>
                                                </div>
                                            ) : (
                                                getQuoteHistory(selectedCustomer.id).map((quote) => (
                                                    <div key={quote.id} className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 hover:border-amber-900/30 transition-colors group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h5 className="font-bold text-white">{quote.productName}</h5>
                                                                <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                                                    <span>quoted on {new Date(quote.date).toLocaleDateString()}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(quote.date).toLocaleTimeString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xl font-bold text-green-400">₹{quote.quotedPrice.toLocaleString()}</div>
                                                                {(quote.retailPriceSnapshot || quote.wholesalePriceSnapshot) && (
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Std: ₹{selectedCustomer.type === 'Wholesale' ? quote.wholesalePriceSnapshot : quote.retailPriceSnapshot}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {quote.notes && (
                                                            <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-300 mb-3 border border-gray-800/50">
                                                                "{quote.notes}"
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditQuote(quote)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/10 rounded transition-colors"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteCustomerQuote(quote.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Form Modal (Nested) */}
            {showQuoteForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">{editingQuoteId ? 'Update Quote' : 'Create New Quote'}</h3>
                            <button onClick={resetQuoteForm} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveQuote} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Select Product</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={quoteForm.productId}
                                        onChange={(e) => {
                                            const prod = products.find(p => p.id === e.target.value);
                                            setQuoteForm({
                                                ...quoteForm,
                                                productId: e.target.value,
                                                productName: prod?.name || '',
                                                quotedPrice: quoteForm.quotedPrice || (selectedCustomer?.type === 'Wholesale' ? prod?.wholesale_price.toString() : prod?.retail_price.toString()) || ''
                                            });
                                        }}
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-amber-500 outline-none text-white appearance-none"
                                    >
                                        <option value="">-- Choose from Inventory --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.in_stock ? 'In' : 'Out'})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Price Reference Info */}
                            {quoteForm.productId && (
                                <div className="flex gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-800">
                                    <div className="flex-1">
                                        <div className="text-[10px] text-gray-500 uppercase">Retail Price</div>
                                        <div className="text-white font-medium">₹{products.find(p => p.id === quoteForm.productId)?.retail_price}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] text-gray-500 uppercase">Wholesale Price</div>
                                        <div className="text-amber-400 font-medium">₹{products.find(p => p.id === quoteForm.productId)?.wholesale_price}</div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Quoted Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    value={quoteForm.quotedPrice}
                                    onChange={e => setQuoteForm({ ...quoteForm, quotedPrice: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-amber-500 outline-none text-white font-mono text-lg"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Notes / Terms</label>
                                <textarea
                                    rows={3}
                                    value={quoteForm.notes}
                                    onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm focus:border-amber-500 outline-none text-white"
                                    placeholder="e.g. Valid for 7 days, MOQ 100 units..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-amber-900/20 transition-all flex justify-center items-center gap-2 mt-4"
                            >
                                <Save size={18} />
                                {editingQuoteId ? 'Update Record' : 'Save Quote Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
