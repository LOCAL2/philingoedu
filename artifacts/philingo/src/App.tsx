import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/language-context';
import { AdminModeProvider, AdminModeToolbar } from '@/components/AdminOverlay';
import { useSiteTracker } from '@/hooks/use-site-tracker';
import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { setSeoGlobalDefaults } from '@/hooks/use-seo-meta';
import { TrackingScripts } from '@/components/TrackingScripts';

import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import About from '@/pages/About';

import WhyPh from '@/pages/WhyPhilippines';
import Courses from '@/pages/Courses';
import Schools from '@/pages/Schools';
import Promotions from '@/pages/Promotions';
import Seminars from '@/pages/Seminars';
import Reviews from '@/pages/Reviews';
import Blog from '@/pages/Blog';
import Register from '@/pages/Register';
import ThankYou from '@/pages/ThankYou';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import SchoolDetail from '@/pages/SchoolDetail';
import CourseLandingPage from '@/pages/CourseLandingPage';
import CityPage from '@/pages/CityPage';
import Services from '@/pages/Services';
import PostDetail from '@/pages/PostDetail';


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/why-philippines" component={WhyPh} />
      <Route path="/courses" component={Courses} />
      <Route path="/schools" component={Schools} />
      <Route path="/schools/city/:city" component={CityPage} />
      <Route path="/schools/:schoolSlug/courses/:courseSlug" component={CourseLandingPage} />
      <Route path="/schools/:slug" component={SchoolDetail} />
      <Route path="/promotions" component={Promotions} />
      <Route path="/seminars" component={Seminars} />
      <Route path="/activities"><Redirect to="/seminars" /></Route>
      <Route path="/reviews" component={Reviews} />
      <Route path="/blog" component={Blog} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/services" component={Services} />
      <Route path="/posts/:id" component={PostDetail} />
      <Route path="/register" component={Register} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** Syncs site_settings.seo_title/seo_description → use-seo-meta global defaults once on load */
function SeoDefaultSync() {
  const s = useSettings();
  useEffect(() => {
    if (s.seo_title || s.seo_description) {
      setSeoGlobalDefaults(s.seo_title ?? '', s.seo_description ?? '');
    }
  }, [s.seo_title, s.seo_description]);
  return null;
}

function SiteEffects() {
  useSiteTracker();
  return null;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <LanguageProvider>
        <AdminModeProvider>
          <TooltipProvider>
            <SiteEffects />
            <SeoDefaultSync />
            <TrackingScripts />
            {/* AdminModeToolbar hidden — ไม่แสดง admin bar บน public site */}
            {/* <AdminModeToolbar /> */}
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AdminModeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
