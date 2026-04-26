'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, Edit, Trash2, Search, X, Save, Loader2, 
    Tag, Calendar, Percent, IndianRupee, AlertCircle, 
    CheckCircle, XCircle, MoreHorizontal, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    expiry_date: string | null;
    usage_limit: number | null;
    usage_count: number;
    active: boolean;
    created_at: string;
}

export default function CouponsAdminPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({});

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching coupons:', error);
        else setCoupons(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const payload = {
                ...currentCoupon,
                code: currentCoupon.code?.toUpperCase().replace(/\s/g, ''),
                discount_value: Number(currentCoupon.discount_value),
                min_order_amount: Number(currentCoupon.min_order_amount || 0),
                max_discount_amount: currentCoupon.max_discount_amount ? Number(currentCoupon.max_discount_amount) : null,
                usage_limit: currentCoupon.usage_limit ? Number(currentCoupon.usage_limit) : null,
            };

            if (isEditing && currentCoupon.id) {
                const { error } = await supabase
                    .from('coupons')
                    .update(payload)
                    .eq('id', currentCoupon.id);
                if (error) throw error;
            } else {
                const { id, ...newCoupon } = payload as any;
                const { error } = await supabase
                    .from('coupons')
                    .insert([newCoupon]);
                if (error) throw error;
            }

            setShowForm(false);
            fetchCoupons();
        } catch (error: any) {
            alert('Error saving coupon: ' + error.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon? This will invalidate all future uses.')) return;

        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error: any) {
            alert('Error deleting coupon: ' + error.message);
        }
    };

    const handleToggleActive = async (coupon: Coupon) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ active: !coupon.active })
                .eq('id', coupon.id);
            if (error) throw error;
            fetchCoupons();
        } catch (error: any) {
            alert('Error toggling status: ' + error.message);
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setCurrentCoupon(coupon);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setCurrentCoupon({
            code: '',
            discount_type: 'percentage',
            discount_value: 10,
            min_order_amount: 0,
            active: true,
            usage_limit: null,
            expiry_date: null
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 max-w-[1600px] mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white flex items-center gap-4">
                        <Tag className="text-purple-500" size={40} /> Campaign Hub
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">Engineered for strategic discounts & growth metrics</p>
                </div>
                <button 
                    onClick={handleAddNew}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 text-sm font-black shadow-2xl shadow-purple-900/40 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} /> NEW COUPON
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="text"
                            placeholder="Search coupon codes..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            <tr>
                                <th className="px-8 py-6">Coupon Identity</th>
                                <th className="px-8 py-6">Discount Profile</th>
                                <th className="px-8 py-6">Transmission Stats</th>
                                <th className="px-8 py-6">Validity</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin text-purple-500 mx-auto" size={48} /></td></tr>
                            ) : filteredCoupons.map(coupon => (
                                <tr key={coupon.id} className="group hover:bg-purple-900/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${coupon.active ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-600 border border-gray-700'}`}>
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <div className="text-white font-black text-xl tracking-tight uppercase">{coupon.code}</div>
                                                <div className="text-[10px] font-black uppercase text-gray-600 mt-1">ID: {coupon.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black text-white">
                                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Off</span>
                                            </div>
                                            <div className="text-[10px] text-purple-500 font-bold uppercase">
                                                {coupon.discount_type === 'percentage' ? 'Percentage Based' : 'Fixed Amount'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-lg font-black text-white">
                                                {coupon.usage_count} / {coupon.usage_limit || '∞'}
                                            </div>
                                            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-purple-500 transition-all" 
                                                    style={{ width: coupon.usage_limit ? `${(coupon.usage_count / coupon.usage_limit) * 100}%` : '10%' }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-black uppercase">Active Transmissions</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className={`flex items-center gap-2 text-xs font-bold ${coupon.active ? 'text-green-500' : 'text-red-500'}`}>
                                                {coupon.active ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                                {coupon.active ? 'System Operational' : 'Transmission Halted'}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-black uppercase flex items-center gap-2">
                                                <Calendar size={12}/> {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button 
                                                onClick={() => handleToggleActive(coupon)} 
                                                className={`p-3 rounded-2xl transition-all ${coupon.active ? 'bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white' : 'bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white'}`}
                                                title={coupon.active ? 'Disable Coupon' : 'Enable Coupon'}
                                            >
                                                {coupon.active ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                            </button>
                                            <button onClick={() => handleEdit(coupon)} className="p-3 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white rounded-2xl transition-all"><Edit size={20} /></button>
                                            <button onClick={() => handleDelete(coupon.id)} className="p-3 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 size={20} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-10 border-b border-gray-800 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                        <Zap size={14} fill="currentColor" /> Discount Protocol
                                    </div>
                                    <h2 className="text-4xl font-black text-white">{isEditing ? 'Modify Logic' : 'Initialize Logic'}</h2>
                                </div>
                                <button onClick={() => setShowForm(false)} className="w-12 h-12 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-gradient-to-b from-gray-900 to-black">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Coupon Identifier (Code)</label>
                                    <input 
                                        required
                                        value={currentCoupon.code || ''}
                                        onChange={e => setCurrentCoupon({...currentCoupon, code: e.target.value.toUpperCase()})}
                                        className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-2xl font-black text-white focus:border-purple-500 outline-none uppercase transition-all"
                                        placeholder="E.G. FESTIVE50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Discount Logic</label>
                                        <div className="flex bg-black border border-gray-800 rounded-2xl p-1">
                                            <button 
                                                type="button"
                                                onClick={() => setCurrentCoupon({...currentCoupon, discount_type: 'percentage'})}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${currentCoupon.discount_type === 'percentage' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <Percent size={14}/> PERCENT
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setCurrentCoupon({...currentCoupon, discount_type: 'fixed'})}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${currentCoupon.discount_type === 'fixed' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <IndianRupee size={14}/> FIXED
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Value</label>
                                        <input 
                                            type="number"
                                            required
                                            value={currentCoupon.discount_value || ''}
                                            onChange={e => setCurrentCoupon({...currentCoupon, discount_value: parseFloat(e.target.value)})}
                                            className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-xl font-black text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Min. Cart Value (₹)</label>
                                        <input 
                                            type="number"
                                            value={currentCoupon.min_order_amount || 0}
                                            onChange={e => setCurrentCoupon({...currentCoupon, min_order_amount: parseFloat(e.target.value)})}
                                            className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Max Usage Limit</label>
                                        <input 
                                            type="number"
                                            value={currentCoupon.usage_limit || ''}
                                            onChange={e => setCurrentCoupon({...currentCoupon, usage_limit: parseInt(e.target.value)})}
                                            className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none font-bold"
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Expiry Termination Date</label>
                                    <input 
                                        type="date"
                                        value={currentCoupon.expiry_date ? currentCoupon.expiry_date.split('T')[0] : ''}
                                        onChange={e => setCurrentCoupon({...currentCoupon, expiry_date: e.target.value})}
                                        className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none font-bold"
                                    />
                                </div>

                                <div className="flex justify-end gap-6 pt-6 border-t border-gray-800">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowForm(false)}
                                        className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={formLoading}
                                        className="px-16 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-purple-900/40 transition-all flex items-center gap-3"
                                    >
                                        {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {isEditing ? 'Sync Logic' : 'Activate Campaign'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
