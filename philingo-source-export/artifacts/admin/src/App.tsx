import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router as WouterRouter, Switch, Route, Redirect } from 'wouter';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/LoadingSpinner';

// Pages
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { SchoolsPage } from '@/pages/Schools';
import { CoursesPage } from '@/pages/Courses';
import { BlogPage } from '@/pages/Blog';
import { ReviewsPage } from '@/pages/Reviews';
import { FAQsPage } from '@/pages/FAQs';
import { TestimonialsPage } from '@/pages/Testimonials';
import { PromotionsPage } from '@/pages/Promotions';
import { BannersPage } from '@/pages/Banners';
import { PartnersPage } from '@/pages/Partners';
import { GalleryPage } from '@/pages/Gallery';
import { TeamPage } from '@/pages/Team';
import { ContactsPage } from '@/pages/Contacts';
import { FormsPage } from '@/pages/Forms';
import { SettingsPage } from '@/pages/Settings';
import { NewsletterPage } from '@/pages/Newsletter';
import { EventsPage } from '@/pages/Events';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoader />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <LoginPage />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/schools">
        <ProtectedRoute component={SchoolsPage} />
      </Route>
      <Route path="/courses">
        <ProtectedRoute component={CoursesPage} />
      </Route>
      <Route path="/blog">
        <ProtectedRoute component={BlogPage} />
      </Route>
      <Route path="/reviews">
        <ProtectedRoute component={ReviewsPage} />
      </Route>
      <Route path="/faqs">
        <ProtectedRoute component={FAQsPage} />
      </Route>
      <Route path="/testimonials">
        <ProtectedRoute component={TestimonialsPage} />
      </Route>
      <Route path="/promotions">
        <ProtectedRoute component={PromotionsPage} />
      </Route>
      <Route path="/banners">
        <ProtectedRoute component={BannersPage} />
      </Route>
      <Route path="/partners">
        <ProtectedRoute component={PartnersPage} />
      </Route>
      <Route path="/gallery">
        <ProtectedRoute component={GalleryPage} />
      </Route>
      <Route path="/team">
        <ProtectedRoute component={TeamPage} />
      </Route>
      <Route path="/contacts">
        <ProtectedRoute component={ContactsPage} />
      </Route>
      <Route path="/forms">
        <ProtectedRoute component={FormsPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/newsletter">
        <ProtectedRoute component={NewsletterPage} />
      </Route>
      <Route path="/events">
        <ProtectedRoute component={EventsPage} />
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  // BASE_URL ends with "/" e.g. "/admin/"
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={base}>
          <AppRoutes />
        </WouterRouter>
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
