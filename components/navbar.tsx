"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Bell, 
  UserRoundPen, 
  Globe,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  userName?: string | null;
  userImage?: string | null;
  userRole?: string | null;
  username?: string | null;
}

export function Navbar({ userName, userImage, userRole, username }: NavbarProps) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard Overview";
    if (path === "/profile/edit") return "Profile Settings";
    if (path === "/account") return "Account Settings";
    if (path.startsWith("/admin/users")) return "User Management";
    if (path.startsWith("/admin/cards")) return "Card Management";
    if (path === "/admin") return "Admin Console";
    return "Zyre Link";
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center px-4 md:px-8">
        {/* Mobile hamburger button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-3 h-9 w-9 border border-border/50 bg-background/50 shadow-sm"
          onClick={() => {
            if (typeof document !== "undefined") {
              const event = new Event("openMobileSidebar");
              document.dispatchEvent(event);
            }
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Header Title */}
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground md:text-base animate-in fade-in slide-in-from-left-2 duration-300">
            {getPageTitle(pathname)}
          </h2>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
        
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0 border border-primary/10 hover:border-secondary/30 transition-all">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={userImage || ""} alt={userName || "User"} />
                  <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-bold">
                    {userName?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={userRole === "ADMIN" ? "/admin" : "/profile/edit"}>
                  <UserRoundPen className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/account">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              {userRole !== "ADMIN" && username && (
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={`/profile/${username}`}>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>View Public Profile</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
