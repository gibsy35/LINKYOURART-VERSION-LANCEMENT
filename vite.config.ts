import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'site.webmanifest',
        includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'LinkYourArt',
          short_name: 'LYA',
          description: 'The global certification standard for creative work.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#0D1117',
          theme_color: '#0D1117',
          icons: [
            { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Precache the built app shell (JS/CSS/HTML/icons) for instant
          // repeat loads and basic offline resilience. Firestore/Firebase
          // Auth/Stripe calls are left alone (network-only, no caching) —
          // caching live payment or auth data would be actively wrong.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'vendor-motion': ['motion/react'],
            'vendor-charts': ['recharts'],
            'vendor-icons': ['lucide-react'],
            'views-admin': [
              './src/views/AdminView.tsx',
              './src/components/AdminKeysManagement.tsx',
            ],
            'views-dashboards': [
              './src/views/CreatorDashboardView.tsx',
              './src/views/InvestorDashboardView.tsx',
              './src/views/ProfessionalDashboardView.tsx',
            ],
            'views-exchange': [
              './src/views/SwipeView.tsx',
              './src/views/ContractDetailView.tsx',
              './src/views/WalletView.tsx',
            ],
            'views-community': [
              './src/views/SocialFeedView.tsx',
              './src/views/GovernanceView.tsx',
              './src/views/LoungeView.tsx',
            ],
            'views-legal': [
              './src/views/LegalView.tsx',
              './src/views/SettingsView.tsx',
              './src/views/ProfileView.tsx',
            ],
            'views-onboarding': [
              './src/components/ConceptTutorial.tsx',
              './src/components/OnboardingWizard.tsx',
            ],
            'views-secondary': [
              './src/views/AcademyView.tsx',
              './src/views/CompareView.tsx',
              './src/views/RegistryView.tsx',
              './src/views/WatchlistView.tsx',
              './src/views/PricingView.tsx',
              './src/views/APIView.tsx',
              './src/views/AboutView.tsx',
            ],
            'views-project': [
              './src/views/ProjectPublicView.tsx',
              './src/views/MecenatView.tsx',
              './src/views/LinkArtView.tsx',
              './src/views/PaymentView.tsx',
            ],
            'views-auth': [
              './src/views/LoginView.tsx',
              './src/views/SignupView.tsx',
              './src/views/ApplyForVerificationView.tsx',
              './src/views/PendingApprovalView.tsx',
            ],
          },
        },
      },
    },
    server: {
      hmr: false,
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
