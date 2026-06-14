import { Switch, Route, Router as WouterRouter, useParams, useLocation, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { detectLocale } from "@/lib/i18n";
import { Suspense, lazy, useEffect } from "react";

import LandingPage from "@/pages/LandingPage";

const CreatePage = lazy(() => import("@/pages/CreatePage"));
const LessonPage = lazy(() => import("@/pages/LessonPage"));
const ArPage = lazy(() => import("@/pages/ArPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function LangRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const lang = detectLocale();
    setLocation(`/${lang}`);
  }, [setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LangRedirect} />
      <Route path="/:lang" component={LandingPage} />
      <Route path="/:lang/create" component={CreatePage} />
      <Route path="/:lang/lesson/:id" component={LessonPage} />
      <Route path="/:lang/ar" component={ArPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-7xl font-bold text-foreground">404</h1>
            <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Suspense fallback={<PageLoader />}>
          <Router />
        </Suspense>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
