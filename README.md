# Hone Instrumental Store - eCommerce Platform

A full-stack eCommerce platform for selling instrumental audio packs and sound libraries, built with Next.js, Express.js, MongoDB, and Chapa.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Payments**: Chapa
- **Storage**: Cloudinary
- **Integrations**: Telegram Bot API, Leaflet Maps

## Project Structure

```
├── frontend/              # Next.js application
│   ├── app/              # Pages and layouts
│   ├── components/       # React components
│   ├── lib/              # Utilities, stores, types
│   └── public/           # Static assets
│
└── backend/              # Express.js server
    ├── src/
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   ├── controllers/  # Route handlers
    │   ├── middleware/   # Express middleware
    │   ├── services/     # Business logic
    │   └── utils/        # Utilities
    └── tests/            # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or Atlas)
- Stripe account
- Cloudinary account
- Telegram Bot token

### Frontend Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL and keys

# Run development server
pnpm dev
```

Frontend runs on http://localhost:3000

### Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Stripe keys, etc.

# Run development server
pnpm dev
```

Backend runs on http://localhost:5000

## Implementation Phases

### Phase 1: ✅ Project Setup & Database Foundation
- [x] Next.js frontend initialization with Stripe
- [x] Express.js backend with TypeScript
- [x] MongoDB models (User, Product, Order, Customer, TelegramLink)
- [x] JWT authentication with refresh tokens
- [x] Zustand stores (cart, comparison)
- [x] API client with axios
- [x] Error handling and middleware

### Phase 2: ✅ Core Storefront & Cart
- [x] Product listing with filtering and search
- [x] Product detail page with audio demos
- [x] Cart management with Zustand persistence
- [x] Checkout flow with shipping options
- [x] Category browsing
- [x] Audio player component
- [x] Product images and media

### Phase 3: ✅ Orders & Admin Panel
- [x] Order creation and management
- [x] Admin dashboard with statistics
- [x] Product CRUD interface
- [x] Customer management
- [x] Order status tracking and updates
- [x] Customer account page with order history

### Phase 4: ✅ Payments & Stripe Integration
- [x] Stripe Elements integration
- [x] Payment intent creation
- [x] Webhook handling for payment confirmation
- [x] Order status automation on payment
- [x] Payment success/failure pages
- [x] Secure payment processing

### Phase 5: ✅ Product Comparison & Audio Demos
- [x] Product comparison page (up to 4 items)
- [x] Side-by-side feature comparison
- [x] Audio player with playback controls
- [x] Download button for demos
- [x] Comparison persistence with Zustand

### Phase 6: ✅ Telegram Integration
- [x] Telegram bot setup with /add_product command
- [x] Product import from Telegram messages
- [x] Bot command handlers
- [x] Telegram user linking
- [x] Account settings for Telegram integration

### Phase 7: ✅ Map Integration
- [x] Store locations map with Leaflet
- [x] Store details (address, hours, contact)
- [x] Interactive location selection
- [x] Business hours display
- [x] Responsive map layout

### Phase 8: ✅ SEO & Performance
- [x] Metadata optimization
- [x] Sitemap.xml and robots.txt
- [x] Open Graph tags
- [x] Schema.org structured data
- [x] About page with team info
- [x] Contact page with contact form
- [x] FAQ section

### Phase 9: ✅ Testing, Security & Deployment
- [x] JWT security with bcrypt hashing
- [x] CORS and rate limiting
- [x] Input validation with Zod
- [x] Error handling and logging
- [x] Stripe webhook security verification
- [x] Deployment guide (Vercel + Railway)
- [x] Security best practices documentation

### Phase 4: Payments & Stripe Integration
- [ ] Stripe payment intent creation
- [ ] Payment confirmation flow
- [ ] Webhook handling
- [ ] Order fulfillment

### Phase 5: Product Comparison & Audio Demos
- [ ] Product comparison table
- [ ] Audio player component
- [ ] Comparison store management
- [ ] Audio demo integration

### Phase 6: Telegram Integration
- [ ] "Chat with Seller" button
- [ ] Telegram bot setup
- [ ] Product import via `/add_product` command
- [ ] Media handling

### Phase 7: Map Integration
- [ ] Leaflet map setup
- [ ] Store location display
- [ ] Delivery zone visualization

### Phase 8: SEO & Performance
- [ ] Dynamic metadata generation
- [ ] Structured data (JSON-LD)
- [ ] Image optimization
- [ ] ISR setup

### Phase 9: Testing & Deployment
- [ ] Unit and E2E tests
- [ ] Security hardening
- [ ] Vercel deployment
- [ ] Backend deployment (Railway/Render)

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotHandle
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hone-instrumental-store
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
TELEGRAM_BOT_TOKEN=...
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/search?q=...` - Search products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug

### Orders (Phase 3+)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `PATCH /api/orders/:id` - Update order status (admin)

### Customers (Phase 3+)
- `GET /api/customers/profile` - Get customer profile
- `GET /api/customers/orders` - Get customer orders
- `POST /api/customers/addresses` - Add address

### Admin (Phase 3+)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Payments (Phase 4+)
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook

### Telegram (Phase 6+)
- `POST /api/telegram/webhook` - Telegram bot webhook

## Development Workflow

1. **Frontend Development**: Run `pnpm dev` in the root directory
2. **Backend Development**: Run `pnpm dev` in the backend directory
3. **Database**: Use MongoDB Atlas or local MongoDB instance
4. **Testing**: Use Jest for unit tests, Playwright for E2E tests

## Deployment

### Frontend (Vercel)
```bash
# Push to GitHub and connect to Vercel
# Set environment variables in Vercel dashboard
```

### Backend (Railway/Render/Heroku)
```bash
# Connect repository to deployment platform
# Set environment variables
# Deploy with automatic builds
```

### Database (MongoDB Atlas)
```bash
# Create cluster
# Get connection string
# Set in backend .env
```

## Contributing

TBD

## License

TBD
