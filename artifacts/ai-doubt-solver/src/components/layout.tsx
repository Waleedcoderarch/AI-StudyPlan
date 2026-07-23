import { Link, useLocation } from "wouter"
import { 
  MessageSquare, 
  FileText, 
  BrainCircuit, 
  History, 
  Home,
  Menu
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"

interface SidebarProps {
  className?: string
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Doubt Solver", icon: MessageSquare },
  { href: "/notes", label: "Notes Gen", icon: FileText },
  { href: "/quiz", label: "Quiz Gen", icon: BrainCircuit },
  { href: "/history", label: "History", icon: History },
]

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation()
  
  return (
    <div className={`pb-12 border-r bg-sidebar text-sidebar-foreground h-[100dvh] flex flex-col ${className}`}>
      <div className="space-y-4 py-4 flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            LearnCompanion
          </h2>
          <div className="space-y-1 mt-4">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 flex items-center justify-between border-t border-sidebar-border">
        <span className="text-sm font-medium">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-sidebar">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background">
      <div className="flex flex-1">
        <aside className="hidden w-64 md:block flex-shrink-0">
          <Sidebar />
        </aside>
        <main className="flex flex-col flex-1 w-full max-w-full overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
            <MobileSidebar />
            <h1 className="font-semibold text-lg">LearnCompanion</h1>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-background/50">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}