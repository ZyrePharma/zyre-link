"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  BarChart3, 
  Globe, 
  ShieldCheck, 
  LogOut,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const mainNavItems = [
  { name: "My Card", href: "/dashboard", icon: LayoutDashboard },
  { name: "Edit Profile", href: "/dashboard/edit-profile", icon: User },
  { name: "My Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const sharedNavItems = [
  { name: "Directory", href: "/directory", icon: Globe },
];

const adminNavItems = [
  { name: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
  { name: "Employee Management", href: "/admin/users", icon: Users },
  { name: "NFC Cards", href: "/admin/cards", icon: Settings },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600">ZYRE LINK</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</h2>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Public</h2>
          <nav className="space-y-1">
            {sharedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {userRole === "ADMIN" && (
          <div>
            <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin</h2>
            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full flex justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </Button>
      </div>
    </aside>
  );
}
