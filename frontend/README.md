# RoastMaster AI - Frontend

AI-Powered Coffee Roasting Control System for the ROEST L200 Ultra

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your backend URL
# VITE_API_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
src/
├── api/              # API service clients
│   ├── client.ts     # Axios instance with JWT interceptor
│   ├── auth.ts       # Authentication endpoints
│   ├── roasts.ts     # Roast CRUD operations
│   ├── profiles.ts   # Profile management
│   ├── inventory.ts  # Coffee inventory
│   ├── analytics.ts  # Analytics data
│   └── ai.ts         # AI integration endpoints
├── types/            # TypeScript interfaces
├── hooks/            # Custom React hooks
│   ├── useAuth.ts    # Authentication state
│   ├── useSocket.ts  # WebSocket management
│   └── useRoastMonitor.ts # Real-time roast data
├── store/            # Zustand state management
├── components/       # Reusable UI components
│   ├── Layout.tsx    # Main layout wrapper
│   ├── RoastChart.tsx
│   ├── TemperatureGauge.tsx
│   ├── AnomalyAlert.tsx
│   ├── FlavorWheel.tsx
│   └── ...
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── RoastMonitor.tsx
│   ├── ProfileBuilder.tsx
│   ├── RoastHistory.tsx
│   ├── CoffeeInventory.tsx
│   ├── Analytics.tsx
│   ├── CuppingForm.tsx
│   └── Settings.tsx
├── App.tsx           # Router setup
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## 🎨 Design System

### Color Palette
- **Dark Theme (default)**: Espresso-based (`#1c1c1c` to `#3d3d3d`)
- **Primary**: Amber/Gold (`#f59e0b`, `#fbbf24`)
- **Accent**: Coffee Browns (`#8B4513`, `#A0522D`)
- **Success**: Green (`#22c55e`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Components
All components use Tailwind CSS for styling with custom Tailwind config for coffee-themed colors.

## 🔐 Authentication

- JWT token-based authentication
- Automatic token refresh via interceptors
- Secure localStorage storage
- Protected routes with `ProtectedRoute` component

## 🔌 Real-Time Features

- WebSocket connection for live roast monitoring
- Real-time temperature data streaming
- Anomaly alerts with AI-powered suggestions
- Live RoR (Rate of Rise) calculations

## 📊 Main Features

### Dashboard
- Summary statistics
- Recent roasts overview
- Quality trends chart
- Quick action buttons

### Roast Monitor (Main Page)
- Real-time multi-line temperature curve
- Control panel (Power, Airflow, RPM)
- Current readings display
- Anomaly alerts with AI suggestions
- Phase timeline
- Emergency stop button

### Profile Builder
- AI-assisted profile generation
- Interactive phase editor
- Flavor wheel selector
- Profile templates

### Roast History
- Filterable roast list
- Detailed roast analysis
- Compare mode for multiple roasts
- Export capability

### Coffee Inventory
- Green coffee management
- Add/Edit/Delete operations
- Roast history per coffee
- Cupping notes integration

### Analytics
- Quality trends over time
- Development time vs quality scatter plot
- RoR pattern analysis
- Origin analysis
- Profile performance metrics
- AI-generated insights

### Cupping Form
- SCA standard scoring
- Flavor wheel selector
- Score radar visualization
- Taste notes recording

### Settings
- Profile management
- Password change
- Preferences (notifications, theme, RTL)

## 🚀 Deployment

### Netlify

```bash
# Deploy to Netlify
npm run build
# Netlify automatically deploys from git or use:
netlify deploy --prod
```

Configuration is in `netlify.toml` with:
- SPA redirect rules
- Security headers
- Cache policies
- Environment variable support

### Environment Variables

```env
VITE_API_URL=https://your-backend-url.com
VITE_APP_NAME=RoastMaster AI
```

## 🛠️ Development

### Tech Stack
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router v6** - Navigation
- **Zustand** - State management
- **Recharts** - Data visualization
- **Socket.io-client** - WebSocket
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Code Style
- ESLint for linting
- TypeScript strict mode enabled
- Functional components with hooks
- Proper error handling

### Performance
- Code splitting with React Router
- Lazy loading where appropriate
- Optimized bundle size
- WebSocket for efficient real-time data

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Sidebar navigation collapse on mobile
- Touch-friendly controls
- Responsive grid layouts

## ♿ Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast compliance

## 🌍 Internationalization Ready

- RTL support framework in place
- Text properly structured for translation
- Date formatting with date-fns

## 📝 API Integration

All API calls go through typed service files:
- Automatic JWT injection
- Error handling and toast notifications
- Response type validation
- Request/response interceptors

## 🐛 Troubleshooting

### CORS Issues
Ensure backend CORS is configured correctly and API URL matches in .env

### Socket Connection Failures
- Check backend is running on correct port
- Verify WebSocket support enabled in backend
- Check browser DevTools Network tab

### Token Expiration
- Automatic refresh handled via interceptor
- If still failing, clear localStorage and re-login

## 📄 License

Proprietary - RoastMaster AI
