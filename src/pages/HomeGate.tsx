import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useSiteMode } from '@/hooks/useSiteMode';

// Both pages stay lazy-loaded so only the active one is fetched.
const Index = lazy(() => import('./Index'));
const PasteBoard = lazy(() => import('./PasteBoard'));

const loadingIndicator = (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

/**
 * Gate for the site's main entry point ("/"). The admin-controlled mode stored
 * in Supabase decides whether visitors see the portfolio or the Paste Board.
 */
const HomeGate = () => {
  const { mode, loading } = useSiteMode();

  if (loading) return loadingIndicator;

  return (
    <Suspense fallback={loadingIndicator}>
      {mode === 'paste_board' ? <PasteBoard /> : <Index />}
    </Suspense>
  );
};

export default HomeGate;
