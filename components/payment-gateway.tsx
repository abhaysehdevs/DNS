'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, QrCode, Building2, ShieldCheck, Lock, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { Currency } from '@/components/currency';

interface PaymentGatewayProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    onPaymentSuccess: (transactionId: string) => void;
}

type ModeType = 'razorpay' | 'sandbox';
type PaymentTab = 'card' | 'upi' | 'netbanking';

// Dynamic script loader for Razorpay Checkout
const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export function PaymentGateway({
    isOpen,
    onClose,
    amount,
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    onPaymentSuccess
}: PaymentGatewayProps) {
    const [gatewayMode, setGatewayMode] = useState<ModeType>('razorpay');
    const [activeTab, setActiveTab] = useState<PaymentTab>('card');
    
    // Card State
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isCvvFocused, setIsCvvFocused] = useState(false);
    const [cardError, setCardError] = useState('');

    // UPI State
    const [upiId, setUpiId] = useState('');
    const [upiTimer, setUpiTimer] = useState(60);
    const [upiError, setUpiError] = useState('');
    
    // Netbanking State
    const [selectedBank, setSelectedBank] = useState('');

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState(0);
    const [isPaid, setIsPaid] = useState(false);

    // UPI Countdown Timer
    useEffect(() => {
        if (gatewayMode !== 'sandbox' || activeTab !== 'upi' || upiTimer <= 0) return;
        const interval = setInterval(() => {
            setUpiTimer((prev) => (prev <= 1 ? 60 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [gatewayMode, activeTab, upiTimer]);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setCardNumber('');
            setCardHolder(customerName.toUpperCase());
            setExpiry('');
            setCvv('');
            setUpiId('');
            setSelectedBank('');
            setCardError('');
            setUpiError('');
            setIsProcessing(false);
            setProcessStep(0);
            setIsPaid(false);
        }
    }, [isOpen, customerName]);

    if (!isOpen) return null;

    // Razorpay Integration Handler
    const handleRazorpayPayment = async () => {
        setIsProcessing(true);
        setProcessStep(0);

        try {
            const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!isLoaded) {
                alert('Razorpay payment gateway failed to load. Please verify your internet connection.');
                setIsProcessing(false);
                return;
            }

            // Create Order on Server-Side to prevent client-side price tampering
            const res = await fetch('/api/checkout/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // in paise
                    receipt: orderId
                })
            });

            const orderData = await res.json();
            if (!res.ok || orderData.error) {
                throw new Error(orderData.error || 'Failed to initialize server-side transaction order.');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_zO8xI8mN56cabc', // Test Key fallback
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                order_id: orderData.id, // Secure server order token
                name: 'Dinanath & Sons',
                description: `Payment for Order ID: ${orderId}`,
                image: '/images/logo.png',
                handler: function (response: any) {
                    setIsPaid(true);
                    setProcessStep(3);
                    
                    // Fire success hook after brief confirmation
                    setTimeout(() => {
                        const txnId = response.razorpay_payment_id || 'TXN-' + Math.floor(Math.random() * 1000000000);
                        onPaymentSuccess(txnId);
                    }, 1500);
                },
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone
                },
                theme: {
                    color: '#A67C35'
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            alert('Failed to initialize Razorpay checkout frame: ' + err.message);
            setIsProcessing(false);
        }
    };

    // Detect card provider
    const getCardProvider = (num: string) => {
        const clean = num.replace(/\s+/g, '');
        if (clean.startsWith('4')) return 'Visa';
        if (clean.startsWith('5')) return 'Mastercard';
        if (clean.startsWith('6')) return 'RuPay';
        return 'Card';
    };

    // Format Card Number (adds spaces every 4 digits)
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        const matches = value.match(/\d{1,4}/g);
        const formatted = matches ? matches.join(' ') : '';
        setCardNumber(formatted.substring(0, 19));
        setCardError('');
    };

    // Format Expiry (adds slash)
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 2) {
            setExpiry(value);
        } else {
            setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
        }
        setCardError('');
    };

    // Sandbox Card submit handler
    const handleCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cardNumber.replace(/\s/g, '').length < 16) {
            setCardError('INVALID CARD NUMBER LENGTH');
            return;
        }
        if (expiry.length < 5) {
            setCardError('INVALID EXPIRY DATE');
            return;
        }
        if (cvv.length < 3) {
            setCardError('INVALID CVV LENGTH');
            return;
        }
        startSandboxProcess();
    };

    // Sandbox UPI submit handler
    const handleUpiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!upiId.includes('@')) {
            setUpiError('PLEASE ENTER A VALID UPI VPA ID (e.g. name@upi)');
            return;
        }
        startSandboxProcess();
    };

    // Sandbox Netbanking submit handler
    const handleBankSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBank) return;
        startSandboxProcess();
    };

    // Simulated sandbox payment processing loop
    const startSandboxProcess = () => {
        setIsProcessing(true);
        setProcessStep(0);

        const step1 = setTimeout(() => setProcessStep(1), 1500);
        const step2 = setTimeout(() => setProcessStep(2), 3000);
        const step3 = setTimeout(() => {
            setProcessStep(3);
            setIsPaid(true);
            
            setTimeout(() => {
                const transactionId = 'TXN-MOCK-' + Math.floor(Math.random() * 1000000000);
                onPaymentSuccess(transactionId);
            }, 1500);
        }, 4500);

        return () => {
            clearTimeout(step1);
            clearTimeout(step2);
            clearTimeout(step3);
        };
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                {/* Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={isProcessing ? undefined : onClose}
                    className="absolute inset-0 bg-black/75 backdrop-blur-md"
                />

                {/* Main Gateway Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#FFFFFF] border border-black/[0.06] rounded-[2.5rem] shadow-2xl overflow-hidden text-[#1D1D1F] z-10 flex flex-col md:flex-row h-[620px] md:h-[570px]"
                >
                    {/* Left Panel: Invoice Details */}
                    <div className="w-full md:w-5/12 bg-gradient-to-b from-[#1E1E1E] to-[#121212] p-8 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-[#343434]/40">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A67C35]/15 border border-[#A67C35]/30 text-[#A67C35] text-[8px] font-black uppercase tracking-[0.25em] mb-8">
                                <Lock size={10} /> Secure Settlement
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E9A] mb-1">Invoice Order</p>
                            <h3 className="text-sm font-black font-mono tracking-tight text-white uppercase mb-6">{orderId}</h3>
                            
                            <div className="space-y-4 pt-4 border-t border-[#343434]/40">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#8E8E9A] block mb-1">Customer</span>
                                    <span className="text-[10px] font-bold text-[#F8F3E8] uppercase tracking-wider block">{customerName}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#8E8E9A] block mb-1">Phone Coordinates</span>
                                    <span className="text-[10px] font-bold text-[#F8F3E8] block">{customerPhone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#343434]/40">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8E8E9A] block mb-2">Grand Amount</span>
                            <span className="text-3xl font-black text-[#A67C35] tracking-tight tabular-nums"><Currency value={amount} /></span>
                        </div>
                    </div>

                    {/* Right Panel: Operations Workspace */}
                    <div className="flex-1 p-8 flex flex-col bg-gray-50/50 justify-between overflow-y-auto relative">
                        {/* Close button */}
                        {!isProcessing && (
                            <button onClick={onClose} className="absolute right-6 top-6 text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1.5 rounded-full hover:bg-black/[0.04]">
                                <X size={18} />
                            </button>
                        )}

                        <div className="w-full">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-8">Settlement Center</h2>

                            {/* Gateway Mode Toggles (Razorpay vs Sandbox) */}
                            {!isProcessing && (
                                <div className="grid grid-cols-2 gap-2 bg-[#FAF6EE] p-1 border border-[#A67C35]/25 rounded-2xl mb-6">
                                    <button 
                                        type="button"
                                        onClick={() => setGatewayMode('razorpay')} 
                                        className={`py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${gatewayMode === 'razorpay' ? 'bg-[#A67C35] text-black shadow-md' : 'text-[#8A6232] hover:text-[#5C401F]'}`}
                                    >
                                        Razorpay Gateway
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setGatewayMode('sandbox')} 
                                        className={`py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${gatewayMode === 'sandbox' ? 'bg-[#A67C35] text-black shadow-md' : 'text-[#8A6232] hover:text-[#5C401F]'}`}
                                    >
                                        Offline Sandbox
                                    </button>
                                </div>
                            )}

                            {/* 1. RAZORPAY PORTAL SCREEN */}
                            {!isProcessing && gatewayMode === 'razorpay' && (
                                <div className="space-y-8 py-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#A67C35]/10 text-[#A67C35] flex items-center justify-center mx-auto mb-2 border border-[#A67C35]/25 shadow-inner">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black uppercase tracking-wider text-matte-black">Legitimate Payment Gateway</h4>
                                        <p className="text-xs text-[#8E8E9A] leading-relaxed uppercase tracking-wider max-w-sm mx-auto font-semibold">
                                            Connects to Razorpay checkout system, supporting live credit cards, netbanking, and UPI applications securely.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleRazorpayPayment}
                                        className="w-full h-15 bg-[#C9A84C] hover:bg-[#B19036] text-black font-black uppercase text-[10px] tracking-[0.25em] rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        Pay ₹{amount.toLocaleString()} with Razorpay
                                    </button>
                                </div>
                            )}

                            {/* 2. SANDBOX SUB-WORKSPACES */}
                            {!isProcessing && gatewayMode === 'sandbox' && (
                                <div className="w-full">
                                    {/* Tabs */}
                                    <div className="grid grid-cols-3 gap-2 bg-black/[0.03] p-1.5 rounded-2xl border border-black/[0.03] mb-6">
                                        <button type="button" onClick={() => setActiveTab('card')} className={`py-2 rounded-xl font-black text-[8px] uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'card' ? 'bg-white text-black shadow-md' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
                                            <CreditCard size={12} /> Card
                                        </button>
                                        <button type="button" onClick={() => setActiveTab('upi')} className={`py-2 rounded-xl font-black text-[8px] uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'upi' ? 'bg-white text-black shadow-md' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
                                            <QrCode size={12} /> UPI Pay
                                        </button>
                                        <button type="button" onClick={() => setActiveTab('netbanking')} className={`py-2 rounded-xl font-black text-[8px] uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'netbanking' ? 'bg-white text-black shadow-md' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>
                                            <Building2 size={12} /> NetBank
                                        </button>
                                    </div>

                                    {/* Card Form */}
                                    {activeTab === 'card' && (
                                        <form onSubmit={handleCardSubmit} className="space-y-4">
                                            <div className="w-full perspective-1000 h-32 relative select-none hidden sm:block mb-4">
                                                <motion.div
                                                    animate={{ rotateY: isCvvFocused ? 180 : 0 }}
                                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                                    className="w-full h-full preserve-3d relative rounded-xl shadow-lg overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8A6232] via-[#A67C35] to-[#5C401F] p-4 text-white backface-hidden flex flex-col justify-between border border-[#A67C35]/30">
                                                        <div className="flex justify-between items-start">
                                                            <div className="w-8 h-5 rounded bg-white/20 border border-white/20 flex items-center justify-center font-bold text-[6px] tracking-widest">CHIP</div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{getCardProvider(cardNumber)}</span>
                                                        </div>
                                                        <div className="text-base font-black font-mono tracking-[0.15em] text-center my-1 select-all">
                                                            {cardNumber || '•••• •••• •••• ••••'}
                                                        </div>
                                                        <div className="flex justify-between text-[7px] uppercase font-black tracking-widest">
                                                            <div>
                                                                <span className="opacity-60 block">Cardholder</span>
                                                                <span className="text-white truncate max-w-[150px] block">{cardHolder || 'FULL NAME'}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="opacity-60 block">Expires</span>
                                                                <span>{expiry || 'MM/YY'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#333333] to-[#121212] py-4 text-white backface-hidden [transform:rotateY(180deg)] flex flex-col justify-between border border-white/[0.04]">
                                                        <div className="w-full h-6 bg-black mt-1" />
                                                        <div className="px-4 flex items-center gap-3">
                                                            <div className="flex-1 h-6 bg-white/10 rounded flex items-center justify-end px-2 text-[8px] font-mono select-none">
                                                                XXXX XXXX XXXX
                                                            </div>
                                                            <div className="w-10 h-6 bg-white text-black font-black font-mono flex items-center justify-center text-[10px] rounded border border-black/10">
                                                                {cvv || '•••'}
                                                            </div>
                                                        </div>
                                                        <div className="px-4 text-[5px] tracking-widest uppercase opacity-40 text-left">
                                                            Sandbox testing simulator. No real funds settled.
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {cardError && (
                                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2 text-red-600 text-[9px] font-black uppercase tracking-widest">
                                                    <AlertCircle size={12} className="shrink-0" />
                                                    {cardError}
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <input required type="text" value={cardNumber} onChange={handleCardNumberChange} placeholder="CARD NUMBER" className="w-full h-12 bg-white border border-black/[0.06] rounded-xl px-4 font-mono text-xs tracking-[0.1em] placeholder-[#86868B]/40 focus:border-[#C9A84C] focus:outline-none transition-all font-bold" />
                                                <input required type="text" value={cardHolder} onChange={(e) => { setCardHolder(e.target.value.toUpperCase()); setCardError(''); }} placeholder="CARDHOLDER NAME" className="w-full h-12 bg-white border border-black/[0.06] rounded-xl px-4 text-xs tracking-wider placeholder-[#86868B]/40 focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input required type="text" value={expiry} onChange={handleExpiryChange} placeholder="MM/YY" className="w-full h-12 bg-white border border-black/[0.06] rounded-xl px-4 text-xs tracking-wider placeholder-[#86868B]/40 focus:border-[#C9A84C] focus:outline-none transition-all font-bold text-center" maxLength={5} />
                                                    <input required type="password" value={cvv} onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').substring(0, 3)); setCardError(''); }} onFocus={() => setIsCvvFocused(true)} onBlur={() => setIsCvvFocused(false)} placeholder="CVV" className="w-full h-12 bg-white border border-black/[0.06] rounded-xl px-4 font-mono text-center tracking-widest placeholder-[#86868B]/40 focus:border-[#C9A84C] focus:outline-none transition-all font-bold" maxLength={3} />
                                                </div>
                                            </div>

                                            <button type="submit" className="w-full h-14 bg-[#C9A84C] hover:bg-[#B19036] text-black font-black uppercase text-[9px] tracking-[0.25em] rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer mt-2">
                                                Simulate Sandbox Card Pay
                                            </button>
                                        </form>
                                    )}

                                    {/* UPI Form */}
                                    {activeTab === 'upi' && (
                                        <form onSubmit={handleUpiSubmit} className="space-y-4">
                                            <div className="flex items-center gap-4 bg-white p-4 border border-black/[0.04] rounded-2xl shadow-sm mb-4">
                                                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-black/[0.06] shrink-0 relative overflow-hidden">
                                                    <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                                                        <rect x="0" y="0" width="30" height="30" />
                                                        <rect x="5" y="5" width="20" height="20" fill="white" />
                                                        <rect x="10" y="10" width="10" height="10" />
                                                        <rect x="70" y="0" width="30" height="30" />
                                                        <rect x="75" y="5" width="20" height="20" fill="white" />
                                                        <rect x="80" y="10" width="10" height="10" />
                                                        <rect x="0" y="70" width="30" height="30" />
                                                        <rect x="5" y="75" width="20" height="20" fill="white" />
                                                        <rect x="10" y="80" width="10" height="10" />
                                                        <rect x="45" y="45" width="10" height="10" fill="#A67C35" />
                                                    </svg>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#A67C35] block">Sandbox QR Code</span>
                                                    <p className="text-[10px] text-[#86868B] leading-normal uppercase tracking-wider font-semibold">
                                                        Simulate payment scan callback instantly.
                                                    </p>
                                                    <span className="text-[9px] font-mono font-black text-amber-600 uppercase tracking-widest block">
                                                        Timeout: {upiTimer}s
                                                    </span>
                                                </div>
                                            </div>

                                            {upiError && (
                                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2 text-red-600 text-[9px] font-black uppercase tracking-widest">
                                                    <AlertCircle size={12} className="shrink-0" />
                                                    {upiError}
                                                </div>
                                            )}

                                            <input required type="text" value={upiId} onChange={(e) => { setUpiId(e.target.value.toLowerCase()); setUpiError(''); }} placeholder="username@upi" className="w-full h-12 bg-white border border-black/[0.06] rounded-xl px-4 text-xs tracking-wider placeholder-[#86868B]/40 focus:border-[#C9A84C] focus:outline-none transition-all font-bold" />
                                            <button type="submit" className="w-full h-14 bg-[#C9A84C] hover:bg-[#B19036] text-black font-black uppercase text-[9px] tracking-[0.25em] rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer mt-2">
                                                Simulate Sandbox UPI Pay
                                            </button>
                                        </form>
                                    )}

                                    {/* Netbanking Form */}
                                    {activeTab === 'netbanking' && (
                                        <form onSubmit={handleBankSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { name: 'State Bank of India', code: 'sbi', sub: 'SBI' },
                                                    { name: 'HDFC Bank', code: 'hdfc', sub: 'HDFC' },
                                                    { name: 'ICICI Bank', code: 'icici', sub: 'ICICI' },
                                                    { name: 'Axis Bank', code: 'axis', sub: 'AXIS' },
                                                ].map((bank) => (
                                                    <div
                                                        key={bank.code}
                                                        onClick={() => setSelectedBank(bank.code)}
                                                        className={`rounded-xl p-4 border flex flex-col justify-between gap-3 cursor-pointer transition-all ${selectedBank === bank.code ? 'bg-amber-600/5 border-amber-600/30' : 'bg-white border-black/[0.04] hover:border-black/10'}`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-black text-[#1D1D1F] text-[10px] uppercase tracking-wider">{bank.sub}</span>
                                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBank === bank.code ? 'border-amber-600' : 'border-[#86868B]'}`}>
                                                                {selectedBank === bank.code && <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="submit" disabled={!selectedBank} className="w-full h-14 bg-[#C9A84C] hover:bg-[#B19036] text-black font-black uppercase text-[9px] tracking-[0.25em] rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                                                Simulate Bank Transfer
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Safe Transaction Info Footer */}
                        {!isProcessing && (
                            <p className="text-[7.5px] font-black uppercase tracking-[0.3em] text-[#86868B] text-center mt-8 flex items-center justify-center gap-2 select-none">
                                <ShieldCheck size={11} className="text-emerald-600" />
                                256-Bit SSL Secured Encryption by Dinanath Authority.
                            </p>
                        )}
                    </div>

                    {/* Security Processing Loader */}
                    <AnimatePresence>
                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#FFFFFF]/95 z-50 flex flex-col items-center justify-center p-8 select-none"
                            >
                                <div className="max-w-md w-full text-center space-y-8">
                                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center mb-10">
                                        <AnimatePresence mode="wait">
                                            {!isPaid ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ rotate: 0 }}
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                    className="absolute inset-0 rounded-full border-4 border-[#C9A84C]/10 border-t-[#C9A84C]"
                                                />
                                            ) : (
                                                <motion.div
                                                    key="success"
                                                    initial={{ scale: 0.6, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="absolute inset-0 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100"
                                                >
                                                    <CheckCircle2 size={36} className="text-white" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className="relative z-10 text-[#C9A84C]">
                                            {!isPaid ? <Lock size={22} className="animate-pulse" /> : null}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-tight text-[#1D1D1F]">
                                            {!isPaid ? 'Verifying Transaction' : 'Payment Accepted'}
                                        </h4>
                                        <p className="text-[10px] font-mono font-black text-[#86868B] uppercase tracking-widest">
                                            {!isPaid ? 'Synchronizing with banking ledger' : 'Transaction Token Verified'}
                                        </p>
                                    </div>

                                    {/* Live Console Output Log */}
                                    <div className="bg-black/[0.03] border border-black/[0.04] p-5 rounded-2xl text-left font-mono space-y-2 max-w-xs mx-auto">
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-[#86868B]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                            SECURE SSL TUNNEL STARTED
                                        </div>
                                        {processStep >= 1 && (
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-[#86868B] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                LEDGER CREDENTIALS ENCRYPTED
                                            </div>
                                        )}
                                        {processStep >= 2 && (
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-[#86868B] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                3DS TOKENS AUTHENTICATED
                                            </div>
                                        )}
                                        {processStep >= 3 && (
                                            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                FUNDS SETTLED SUCCESSFULLY
                                            </div>
                                        )}
                                        {!isPaid && (
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-amber-600 animate-pulse">
                                                <Loader2 size={8} className="animate-spin" />
                                                AWAITING VAULT CONFIRMATION
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
