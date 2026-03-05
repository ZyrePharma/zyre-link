"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/zyre_logo.png";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut,
  Users,
  X,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Edit Profile", href: "/dashboard/edit-profile", icon: User },
];

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Employees", href: "/admin/users", icon: Users },
  { name: "NFC Cards", href: "/admin/cards", icon: Settings },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const navItems = userRole === "ADMIN" ? adminNavItems : mainNavItems;

  const sidebarContent = (
    <>
      <div className="p-6 flex justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Image 
            src={logo} 
            alt="Zyre Logo" 
            width={32} 
            height={32} 
            className="rounded-md border p-0.5 bg-white shadow-sm"
          />
          <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">ZYRE LINK</h1>
        </div>
        {/* Close button — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isRoot = item.href === "/dashboard" || item.href === "/admin";
            const isActive = isRoot ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
                {/* Red accent dot on active item */}
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-secondary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Red accent stripe */}
      <div className="h-0.5 bg-gradient-to-r from-secondary via-secondary/50 to-transparent mx-4" />

      <div className="p-4 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full flex justify-start space-x-3 text-secondary hover:bg-secondary/10 hover:text-secondary transition-colors"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 bg-card/90 backdrop-blur border border-border shadow-md"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slides in from left */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
