import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Setup from "./pages/Setup";
import Contact from "./pages/Contact";
import Videos from "./pages/Videos";
import CalendarPage from "./pages/CalendarPage";
import Links from "./pages/Links";
import Recipes from "./pages/Recipes";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminContact from "./pages/admin/AdminContact";
import AdminLinks from "./pages/admin/AdminLinks";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminInvitations from "./pages/admin/AdminInvitations";
import AdminImages from "./pages/admin/AdminImages";
import AdminLogs from "./pages/admin/AdminLogs";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Member */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/setup" component={Setup} />
      <Route path="/contact" component={Contact} />
      <Route path="/videos" component={Videos} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/links" component={Links} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/profile" component={Profile} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/contact" component={AdminContact} />
      <Route path="/admin/links" component={AdminLinks} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/invitations" component={AdminInvitations} />
      <Route path="/admin/images" component={AdminImages} />
      <Route path="/admin/logs" component={AdminLogs} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
