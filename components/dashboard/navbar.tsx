"use client";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  MessageSquare, 
  Globe,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export function Navbar({ userName, userImage }: NavbarProps) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard Overview";
    if (path === "/dashboard/edit-profile") return "Profile Settings";
    if (path.startsWith("/admin/users")) return "User Management";
    if (path.startsWith("/admin/cards")) return "Card Management";
    if (path === "/admin") return "Admin Console";
    return "Zyre Link";
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center px-4 md:px-8">
        {/* Spacer for mobile hamburger button */}
        <div className="w-10 md:hidden" />

        {/* Page Header Title */}
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground md:text-base animate-in fade-in slide-in-from-left-2 duration-300">
            {getPageTitle(pathname)}
          </h2>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-secondary transition-colors h-8 w-8 md:h-10 md:w-10">
            <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-secondary transition-colors h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-secondary ring-2 ring-background" />
          </Button>

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
                  <p className="text-xs leading-none text-muted-foreground">
                    Connected to Zyre Cloud
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Globe className="mr-2 h-4 w-4" />
                <span>View Public Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
