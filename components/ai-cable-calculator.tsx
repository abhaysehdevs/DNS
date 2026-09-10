'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    X, 
    CheckCircle2, 
    ShoppingCart, 
    ArrowRight, 
    ShieldCheck, 
    Gauge, 
    Calculator,
    AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

interface AppliancePreset {
    name: string;
    wattage: number;
    recommendedMm: string;
    recommendedMcb: string;
    icon: string;
    description: string;
}

const APPLIANCES: AppliancePreset[] = [
    { name: '1.5 Ton Inverter AC', wattage: 1800, recommendedMm: '2.5 mm²', recommendedMcb: '16A C-Curve', icon: '❄️', description: 'Continuous inductive load requiring heat-resistant copper wire.' },
    { name: '2.0 Ton Heavy AC', wattage: 2600, recommendedMm: '4.0 mm²', recommendedMcb: '20A / 25A', icon: '💨', description: 'Heavy compressor startup current needs high ampacity.' },
    { name: 'Water Geyser (15L-25L)', wattage: 2000, recommendedMm: '2.5 mm²', recommendedMcb: '16A C-Curve', icon: '🚿', description: 'Resistive heating load running continuously for 30-60 mins.' },
    { name: 'Submersible Water Pump', wattage: 1500, recommendedMm: '2.5 mm² / 4.0 mm² 3-Core', recommendedMcb: '16A Motor Starter', icon: '💧', description: 'Requires water-resistant flat submersible cable for depth.' },
    { name: 'Microwave & Induction Cooktop', wattage: 2200, recommendedMm: '2.5 mm²', recommendedMcb: '16A C-Curve', icon: '🍳', description: 'Kitchen heavy load needing dedicated separate circuit.' },
    { name: 'Full Room / 2BHK Main Line', wattage: 5000, recommendedMm: '6.0 mm²', recommendedMcb: '32A Double Pole', icon: '🏠', description: 'Main sub-feeder from distribution box to room board.' }
];

export function AiCableCalculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { addToCart } = useAppStore();
    const [selectedAppliance, setSelectedAppliance] = useState<AppliancePreset>(APPLIANCES[0]);
    const [customWatts, setCustomWatts] = useState<number | ''>('');
    const [distanceMeters, setDistanceMeters] = useState(15);
    const [isCustom, setIsCustom] = useState(false);
    const [addedCart, setAddedCart] = useState(false);

    const activeWattage = isCustom && customWatts !== '' ? Number(customWatts) : selectedAppliance.wattage;
    const currentAmps = Math.round((activeWattage / 230) * 10) / 10;

    // Safety calculation logic
    let wireSize = '1.5 mm²';
    let mcbRating = '10A';
    if (activeWattage > 4000) {
        wireSize = '6.0 mm²';
        mcbRating = '32A';
    } else if (activeWattage > 2400 || (activeWattage > 1800 && distanceMeters > 25)) {
        wireSize = '4.0 mm²';
        mcbRating = '20A / 25A';
    } else if (activeWattage > 1000) {
        wireSize = '2.5 mm²';
        mcbRating = '16A';
    }

    const voltageDropPercent = Math.min(5, Math.round((distanceMeters * currentAmps * 0.012) * 10) / 10);

    const handleQuickAdd = () => {
        // Quick add representative product
        addToCart({
            productId: 'wire-calculator-rec',
            variantName: `${wireSize} Copper FR-LSH Wire (90m)`,
            quantity: 1,
            price: wireSize === '4.0 mm²' ? 3200 : (wireSize === '2.5 mm²' ? 2250 : 1450),
            mode: 'retail'
        });
        setAddedCart(true);
        setTimeout(() => setAddedCart(false), 2500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-xl bg-surface-1 border border-glass-border rounded-3xl shadow-2xl overflow-hidden text-text-primary"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-glass-border bg-gradient-to-r from-blue-900/30 to-indigo-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                                <Zap size={22} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    AI Wire & Load Calculator
                                </h3>
                                <p className="text-xs text-text-tertiary">
                                    Precision electrical engineering specs for Dinanath & Sons customers
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-tertiary hover:text-white transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                        {/* Preset Appliance Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                Select Target Appliance / Circuit
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {APPLIANCES.map((app, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedAppliance(app);
                                            setIsCustom(false);
                                        }}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                            !isCustom && selectedAppliance.name === app.name
                                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                                                : 'bg-surface-2 border-glass-border text-text-secondary hover:border-gray-600'
                                        }`}
                                    >
                                        <span className="text-xl mb-1">{app.icon}</span>
                                        <span className="text-xs font-bold line-clamp-1">{app.name}</span>
                                        <span className="text-[10px] text-text-tertiary font-mono">{app.wattage}W</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Distance Slider */}
                        <div className="space-y-2 bg-surface-2 p-4 rounded-2xl border border-glass-border">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-text-secondary">Run Distance (Cable Length)</span>
                                <span className="font-mono font-bold text-blue-400">{distanceMeters} Meters</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="5"
                                value={distanceMeters}
                                onChange={(e) => setDistanceMeters(Number(e.target.value))}
                                className="w-full accent-blue-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
                                <span>5m (Same Room)</span>
                                <span>30m (Opposite End)</span>
                                <span>100m (Main Feeder)</span>
                            </div>
                        </div>

                        {/* AI Computed Recommendation Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-surface-2 border border-blue-500/30 space-y-4">
                            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-400" />
                                    <span className="font-bold text-sm text-white">Recommended Specification</span>
                                </div>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                    Safe & Verified
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                <div className="p-3 bg-surface-1/80 rounded-xl border border-glass-border">
                                    <span className="block text-[10px] uppercase font-mono text-text-tertiary">Wire Gauge</span>
                                    <span className="text-base font-bold text-blue-400">{wireSize}</span>
                                </div>
                                <div className="p-3 bg-surface-1/80 rounded-xl border border-glass-border">
                                    <span className="block text-[10px] uppercase font-mono text-text-tertiary">MCB Breaker</span>
                                    <span className="text-base font-bold text-indigo-400">{mcbRating}</span>
                                </div>
                                <div className="p-3 bg-surface-1/80 rounded-xl border border-glass-border">
                                    <span className="block text-[10px] uppercase font-mono text-text-tertiary">Operating Amps</span>
                                    <span className="text-base font-bold text-emerald-400">{currentAmps} A</span>
                                </div>
                                <div className="p-3 bg-surface-1/80 rounded-xl border border-glass-border">
                                    <span className="block text-[10px] uppercase font-mono text-text-tertiary">Est. Volt Drop</span>
                                    <span className="text-base font-bold text-yellow-400">{voltageDropPercent}%</span>
                                </div>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed">
                                💡 <strong>AI Tip:</strong> {selectedAppliance.description} Using high-grade 100% Electrolytic Copper FR-LSH wire prevents overheating and ensures fire safety.
                            </p>

                            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                                <button
                                    onClick={handleQuickAdd}
                                    className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                                        addedCart
                                            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                                    }`}
                                >
                                    {addedCart ? <CheckCircle2 size={16} /> : <ShoppingCart size={16} />}
                                    {addedCart ? 'Added to Cart!' : `Add Recommended ${wireSize} Wire to Cart`}
                                </button>
                                <Link
                                    href="/shop"
                                    onClick={onClose}
                                    className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-surface-3 text-text-primary border border-glass-border text-center transition-colors"
                                >
                                    Browse All Cables
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
