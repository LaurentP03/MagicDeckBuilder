import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Folder, Wand2 } from "lucide-react";
import { Link, useLocation } from "wouter";

// Import pages
import SearchPage from "@/pages/search";
import DeckBuilderPage from "@/pages/deck-builder";
import DeckManagerPage from "@/pages/deck-manager";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/search", label: "Search Cards", icon: Search },
    { path: "/deck-builder", label: "Create Deck", icon: Plus },
    { path: "/deck-manager", label: "My Decks", icon: Folder },
  ];

  return (
    <header className="bg-card shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/search" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Wand2 className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">MTG Deck Builder</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || 
                (item.path === "/search" && location === "/");
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`${isActive ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <div className="text-center py-16 space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          MTG Deck Builder
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Build, manage, and perfect your Magic: The Gathering decks with powerful tools and Scryfall integration
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Link href="/search">
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Search Cards</h3>
              <p className="text-muted-foreground text-sm">
                Discover and explore Magic cards with powerful search and autocomplete
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/deck-builder">
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Build Decks</h3>
              <p className="text-muted-foreground text-sm">
                Create custom decks with drag-and-drop organization and customizable blocks
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/deck-manager">
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Folder className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Manage Collection</h3>
              <p className="text-muted-foreground text-sm">
                Save, edit, and organize your deck collection with import/export features
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Start */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <div className="flex gap-4 justify-center">
          <Link href="/search">
            <Button size="lg">
              <Search className="h-5 w-5 mr-2" />
              Search Cards
            </Button>
          </Link>
          <Link href="/deck-builder">
            <Button variant="outline" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Deck
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/deck-builder" component={DeckBuilderPage} />
      <Route path="/deck-manager" component={DeckManagerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Router />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
