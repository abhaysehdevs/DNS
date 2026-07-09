# Store & Admin Panel Upgrades - Task Tracker

## Phase 1: Layout Isolation & Dashboard Cleanup
- `[x]` **Layout Isolation**: Move storefront pages to route group `(store)` and isolate root layout from storefront navbar/footer.
- `[x]` **AI Assistant Removal**: Remove the AI assistant popup from `/admin` routes.
- `[x]` **Real-Time Analytics Dashboard**: Replace chart with real-time operational metrics (AOV, active sessions, 24h sales, conversions stream).

## Phase 2: Order Management & Automated Notifications
- `[x]` **Checkout Sync**: Ensure checkout process immediately populates "Live Orders" in the admin dashboard.
- `[x]` **Real-time Status**: Live Orders table reflects real DB statuses.
- `[x]` **Email Notifications**: Resend/Nodemailer backend API configuration for new orders/support queries.

## Phase 3: Customer CRM & Account Portals
- `[x]` **Automated CRM**: Auto-create/update customer profile on checkout.
- `[x]` **Lifetime Order History**: Query and display customer's full order history in admin details.
- `[x]` **Customer-Facing Portal**: Shipment tracking and order history dashboard for authenticated storefront users.

## Phase 4: Product Media & Inventory Optimization
- `[x]` **Native Video Uploads**: Support video uploads to Supabase Storage in creation/editing forms.
- `[x]` **Mobile Inventory**: Responsive card-based grid layout for "Inventory Master" with big touch targets.
- `[x]` **Advanced Customization**: Bulk actions (duplicate, edit, delete, toggle stock), SEO metadata fields, and variants SKU mapping.

## Phase 5: CMS Engine & Global Settings
- `[ ]` **Functional CMS**: Storefront pulls CMS changes instantly from DB.
- `[ ]` **Settings Persistence**: Sync admin settings page with global settings DB table.
- `[ ]` **Theme Toggle**: Fix theme mode selector/persistence.
- `[ ]` **Dynamic Currency**: Dynamic selector for global currencies/exchange rates.
- `[ ]` **Store Info Expansion**: Add tax IDs, legal business name, origins, and social links to settings.
