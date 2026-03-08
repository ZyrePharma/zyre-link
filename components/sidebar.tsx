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
  Menu,
  UserRoundPen,
  CreditCard,
  Contact,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Edit Profile", href: "/profile/edit", icon: UserRoundPen },
  { name: "Account Settings", href: "/account", icon: Settings },
];

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Companies", href: "/admin/companies", icon: Building2 },
  { name: "NFC Cards", href: "/admin/cards", icon: CreditCard },
  { name: "Account Settings", href: "/account", icon: Settings },
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

  // Listen for custom open event from Navbar
  useEffect(() => {
    const handleOpen = () => setMobileOpen(true);
    if (typeof document !== "undefined") {
      document.addEventListener("openMobileSidebar", handleOpen);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("openMobileSidebar", handleOpen);
      }
    };
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
          <h1 className="text-xl font-bold tracking-tight text-primary">
            ZYRE <span className="text-secondary">LINK</span>
          </h1>
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
               
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Subtle separator */}
      <div className="h-px bg-sidebar-border/50 mx-4" />

      <div className="p-4 mt-auto">
        <Button 
          variant="ghost" 
          className="group w-full flex justify-between items-center px-4 py-3 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl"
          onClick={() => signOut()}
        >
          <div className="flex items-center space-x-3">
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Log Out</span>
          </div>
        </Button>
      </div>
    </>
  );

  return (
    <>
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
