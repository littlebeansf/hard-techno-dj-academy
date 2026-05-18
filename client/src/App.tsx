import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { Curriculum } from "@/pages/Curriculum";
import { ModuleDetail } from "@/pages/ModuleDetail";
import { DJDeck } from "@/pages/DJDeck";
import { BeatStudio } from "@/pages/BeatStudio";
import { GenreGuide } from "@/pages/GenreGuide";
import NotFound from "@/pages/not-found";

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/curriculum" component={Curriculum} />
            <Route path="/curriculum/:moduleId" component={ModuleDetail} />
            <Route path="/dj-deck" component={DJDeck} />
            <Route path="/beat-studio" component={BeatStudio} />
            <Route path="/genre-guide" component={GenreGuide} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}
