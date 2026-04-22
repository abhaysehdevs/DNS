
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'retail' | 'wholesale';
export type Language = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te'; // English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu

export interface AdminSettings {
    storeName: string;
    adminEmail: string;
    currency: string;
    language: Language;
    maintenanceMode: boolean;
    emailNotifications: boolean;
    stockAlerts: boolean;
    taxRate: number;
    theme: 'light' | 'dark' | 'system';
}

export interface CartItem {
    productId: string;
    variantId?: string; // New: Handle Variants
    variantName?: string; // New: Handle Variants
    quantity: number;
    price: number;
    mode: AppMode; // 'retail' or 'wholesale' depending on the mode when added
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: number;
}

export interface CustomerQuote {
    id: string;
    customerId: string; // Identifier (email or phone)
    customerName: string;
    productId?: string;
    productName: string;
    quotedPrice: number;
    retailPriceSnapshot?: number;
    wholesalePriceSnapshot?: number;
    notes: string;
    date: string;
}

// Auth User
export interface User {
    id: string;
    email: string;
    name?: string;
    created_at?: string;
}

export interface CustomerActivity {
    id: string;
    customerId: string;
    type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Order';
    summary: string;
    details?: string;
    date: string;
    performedBy?: string; // 'Admin'
}

// Enhanced Customer Profile
export interface CustomerProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'Retail' | 'Wholesale';
    status: 'Lead' | 'Active' | 'Inactive' | 'Blocked'; // Lifecycle Status
    tags: string[]; // e.g. "VIP", "Net-30"
    notes?: string;
    createdAt: string;
    lastContactDate?: string;
    nextFollowUpDate?: string;
}

interface AppState {
    // User State
    mode: AppMode;
    language: Language;
    cart: CartItem[];
    user: User | null; // New
    hasSeenLanguagePopup: boolean;
    viewedProducts: string[];
    wishlist: string[];

    // Admin Settings State
    adminSettings: AdminSettings;
    isAdminAuthenticated: boolean;
    notifications: Notification[];
    customerQuotes: CustomerQuote[];
    manualCustomers: CustomerProfile[];
    customerActivities: CustomerActivity[]; // New: Interaction Log
    currencyData: { code: string; symbol: string; rate: number };

    // Actions
    setMode: (mode: AppMode) => void;
    setLanguage: (lang: Language) => void;
    setUser: (user: User | null) => void; // New
    setHasSeenLanguagePopup: (seen: boolean) => void;
    addToCart: (item: CartItem) => void;
    updateQuantity: (productId: string, variantId: string | undefined, mode: AppMode, quantity: number) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    clearCart: () => void;
    viewProduct: (productId: string) => void;
    toggleWishlist: (productId: string) => void;

    // Admin Actions
    loginAdmin: () => void;
    logoutAdmin: () => void;
    updateAdminSettings: (settings: Partial<AdminSettings>) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;

    // Quote Actions
    addCustomerQuote: (quote: Omit<CustomerQuote, 'id'>) => void;
    updateCustomerQuote: (id: string, quote: Partial<CustomerQuote>) => void;
    deleteCustomerQuote: (id: string) => void;

    // Customer Actions
    addManualCustomer: (customer: CustomerProfile) => void;
    updateManualCustomer: (id: string, customer: Partial<CustomerProfile>) => void;
    deleteManualCustomer: (id: string) => void;

    // Activity Actions
    addCustomerActivity: (activity: Omit<CustomerActivity, 'id'>) => void;
    updateCustomerActivity: (id: string, activity: Partial<CustomerActivity>) => void;
    deleteCustomerActivity: (id: string) => void;
    // Currency
    setCurrencyData: (data: { code: string; symbol: string; rate: number }) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            mode: 'retail',
            language: 'en',
            cart: [],
            user: null, // New
            hasSeenLanguagePopup: false,
            viewedProducts: [],
            wishlist: [],

            // Default Admin Settings
            adminSettings: {
                storeName: 'Dinanath & Sons',
                adminEmail: 'admin@dinanath.com',
                currency: 'INR',
                language: 'en',
                maintenanceMode: false,
                emailNotifications: true,
                stockAlerts: true,
                taxRate: 18,
                theme: 'dark'
            },
            isAdminAuthenticated: false,
            notifications: [],
            customerQuotes: [],
            manualCustomers: [],
            customerActivities: [],
            currencyData: { code: 'INR', symbol: '₹', rate: 1 },

            setMode: (mode) => set({ mode }),
            setLanguage: (language) => set((state) => ({
                language,
                adminSettings: { ...state.adminSettings, language }
            })),
            setUser: (user) => set({ user }), // New
            setHasSeenLanguagePopup: (hasSeenLanguagePopup) => set({ hasSeenLanguagePopup }),

            viewProduct: (productId) => set((state) => {
                const newViewed = [productId, ...state.viewedProducts.filter(id => id !== productId)].slice(0, 6);
                return { viewedProducts: newViewed };
            }),

            toggleWishlist: async (productId) => {
                const state = get();
                const exists = state.wishlist.includes(productId);

                // Optimistic Update
                set({
                    wishlist: exists
                        ? state.wishlist.filter(id => id !== productId)
                        : [...state.wishlist, productId]
                });

                // Database Sync
                if (state.user) {
                    try {
                        const { supabase } = await import('@/lib/supabase'); // Dynamic import to avoid circular dependency issues if any
                        if (exists) {
                            await supabase.from('wishlist').delete().match({ user_id: state.user.id, product_id: productId });
                        } else {
                            await supabase.from('wishlist').insert({ user_id: state.user.id, product_id: productId });
                        }
                    } catch (err) {
                        console.error('Wishlist sync error:', err);
                        // Revert on error? For now, keep optimistic. 
                    }
                }
            },

            addToCart: (item) => set((state) => {
                // Check if same product AND same variant exists
                const existingIndex = state.cart.findIndex((i) =>
                    i.productId === item.productId &&
                    i.mode === item.mode &&
                    i.variantId === item.variantId // Exact variant match
                );

                if (existingIndex > -1) {
                    const newCart = [...state.cart];
                    newCart[existingIndex].quantity += item.quantity;
                    return { cart: newCart };
                }
                return { cart: [...state.cart, item] };
            }),

            updateQuantity: (productId, variantId, mode, quantity) => set((state) => {
                if (quantity <= 0) {
                    return {
                        cart: state.cart.filter((i) => !(
                            i.productId === productId &&
                            i.mode === mode &&
                            i.variantId === variantId
                        ))
                    };
                }
                return {
                    cart: state.cart.map((i) =>
                        (i.productId === productId && i.mode === mode && i.variantId === variantId)
                            ? { ...i, quantity }
                            : i
                    )
                };
            }),

            removeFromCart: (id, variantId) => set((state) => ({
                cart: state.cart.filter((i) => !(
                    i.productId === id &&
                    i.variantId === variantId
                ))
            })),

            clearCart: () => set({ cart: [] }),

            // Admin Actions Implementation
            loginAdmin: () => set({ isAdminAuthenticated: true }),
            logoutAdmin: () => set({ isAdminAuthenticated: false }),

            updateAdminSettings: (newSettings) => set((state) => ({
                adminSettings: { ...state.adminSettings, ...newSettings },
                language: newSettings.language || state.language
            })),

            addNotification: (notification) => set((state) => ({
                notifications: [
                    {
                        ...notification,
                        id: Math.random().toString(36).substring(7),
                        read: false,
                        timestamp: Date.now()
                    },
                    ...state.notifications
                ].slice(0, 20)
            })),

            markNotificationAsRead: (id) => set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
            })),

            clearNotifications: () => set({ notifications: [] }),

            // Quote Actions
            addCustomerQuote: (quote) => set((state) => ({
                customerQuotes: [
                    { ...quote, id: Math.random().toString(36).substring(7) },
                    ...state.customerQuotes
                ]
            })),

            updateCustomerQuote: (id, updatedQuote) => set((state) => ({
                customerQuotes: state.customerQuotes.map(q => q.id === id ? { ...q, ...updatedQuote } : q)
            })),

            deleteCustomerQuote: (id) => set((state) => ({
                customerQuotes: state.customerQuotes.filter(q => q.id !== id)
            })),

            // Customer Profile Actions
            addManualCustomer: (customer) => set((state) => ({
                manualCustomers: [...state.manualCustomers, customer]
            })),

            updateManualCustomer: (id, updatedCustomer) => set((state) => ({
                manualCustomers: state.manualCustomers.map(c => c.id === id ? { ...c, ...updatedCustomer } : c)
            })),

            deleteManualCustomer: (id) => set((state) => ({
                manualCustomers: state.manualCustomers.filter(c => c.id !== id)
            })),

            // Activity Logs Actions
            addCustomerActivity: (activity) => set((state) => ({
                customerActivities: [
                    { ...activity, id: Math.random().toString(36).substring(7) },
                    ...state.customerActivities
                ]
            })),

            updateCustomerActivity: (id, updatedActivity) => set((state) => ({
                customerActivities: state.customerActivities.map(a => a.id === id ? { ...a, ...updatedActivity } : a)
            })),

            deleteCustomerActivity: (id) => set((state) => ({
                customerActivities: state.customerActivities.filter(a => a.id !== id)
            })),
            setCurrencyData: (currencyData) => set({ currencyData }),
        }),
        {
            name: 'dinanath-store-storage',
            partialize: (state) => ({
                cart: state.cart,
                mode: state.mode,
                language: state.language,
                hasSeenLanguagePopup: state.hasSeenLanguagePopup,
                viewedProducts: state.viewedProducts,
                wishlist: state.wishlist,
                adminSettings: state.adminSettings,
                isAdminAuthenticated: state.isAdminAuthenticated,
                notifications: state.notifications,
                customerQuotes: state.customerQuotes,
                manualCustomers: state.manualCustomers,
                customerActivities: state.customerActivities, // Persist activities
                currencyData: state.currencyData
            }),
        }
    )
);
