import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { RealtimeProvider } from './hooks/useRealtimeSync';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageShell } from './components/layout/PageShell';
import { AppRoutes } from './routes/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <RealtimeProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#141413]">
              <Header />
              <div className="flex-1 flex flex-col">
                <PageShell>
                  <AppRoutes />
                </PageShell>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </RealtimeProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
