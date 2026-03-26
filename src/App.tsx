import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import AIStylistPage from "./pages/AIStylistPage";
import OutfitDetailPage from "./pages/OutfitDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import PublicProfilePage from "./pages/PublicProfilePage";
import InboxPage from "./pages/InboxPage";
import BottomNav from "./components/BottomNav";
import OnboardingModal from "./components/OnboardingModal";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setNeedsOnboarding(data ? !data.onboarding_complete : true);
        setChecking(false);
      });
  }, [user]);

  if (loading || checking) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <OnboardingModal
        open={needsOnboarding}
        onComplete={() => setNeedsOnboarding(false)}
      />
      {children}
    </>
  );
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <div className="min-h-screen bg-background relative lg:pl-16">
    <Routes>
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/ai-stylist" element={<ProtectedRoute><AIStylistPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/outfit/:id" element={<ProtectedRoute><OutfitDetailPage /></ProtectedRoute>} />
      <Route path="/user/:username" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <BottomNavWrapper />
  </div>
);

const BottomNavWrapper = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <BottomNav />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
