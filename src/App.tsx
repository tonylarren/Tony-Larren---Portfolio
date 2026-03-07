import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from 'react';
import { 
  Loader2,
} from 'lucide-react';

const queryClient = new QueryClient();


const Index = lazy(() => import("./pages/Index"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminProjectForm = lazy(() => import("./pages/AdminProjectForm"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AI = lazy(() => import("./pages/AI")); 

const loadingIndicator = (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={loadingIndicator}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/admin" element={<AdminAuth />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/projects" element={<AdminProjects />} />
                  <Route path="/admin/projects/new" element={<AdminProjectForm />} />
                  <Route path="/admin/projects/edit/:id" element={<AdminProjectForm />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  <Route path="/dev/ai" element={<AI />} /> 
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;