import React, { lazy, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Footer from '@/components/Footer';
import { 
  Loader2,
} from 'lucide-react';

// Use lazy() for components that are not immediately visible
const Projects = lazy(() => import('@/components/Projects'));
const Skills = lazy(() => import('@/components/Skills'));
const Contact = lazy(() => import('@/components/Contact'));

const Index = () => {
  const loadingIndicator = (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <About />
        
        {/* Wrap the lazy-loaded components with Suspense */}
        <Suspense fallback={loadingIndicator}>
          <Projects />
        </Suspense>

        <Suspense fallback={loadingIndicator}>
          <Skills />
        </Suspense>
        
        <Suspense fallback={loadingIndicator}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;