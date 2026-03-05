"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, Sparkles, Check, ChevronsUpDown, Search } from "lucide-react";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
  employeeId: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hrmsUsers, setHrmsUsers] = useState<any[]>([]);
  const [isFetchingHrms, setIsFetchingHrms] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      name: "",
      role: UserRole.EMPLOYEE,
      department: "",
      employeeId: "",
    },
  });

  // Debounced fetch for HRMS users
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setIsFetchingHrms(true);
      try {
        const response = await fetch(`/api/admin/hrms-users?search=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setHrmsUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch HRMS users", error);
      } finally {
        setIsFetchingHrms(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, open]);

  const handleHrmsSelect = (selectedUser: any) => {
    form.setValue("name", selectedUser.name);
    form.setValue("email", selectedUser.email);
    form.setValue("department", selectedUser.department_name || "");
    form.setValue("employeeId", selectedUser.emp_id);
    setSearchTerm(selectedUser.name); // Keep search sync'd with selection
    setPopoverOpen(false);
    toast.info(`Auto-filled details for ${selectedUser.name}`, {
      icon: <Sparkles className="h-4 w-4 text-blue-500" />
    });
  };

  const onSubmit = async (values: InviteFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to invite user");
      }

      toast.success("Employee invited successfully!");
      setOpen(false);
      form.reset();
      setSearchTerm("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-primary/20 shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Add New User</DialogTitle>
         
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
            <div className="pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">User Name</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-11 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all font-bold px-4",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Select or type name..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[375px] p-0 rounded-xl border-primary/10 shadow-2xl" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Type to search or enter new name..." 
                            value={searchTerm}
                            onValueChange={(val) => {
                              setSearchTerm(val);
                              field.onChange(val); // Update form name as user types
                            }}
                            className="h-12 border-none focus:ring-0"
                          />
                          <CommandList>
                            {isFetchingHrms ? (
                              <div className="p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Searching HRMS...
                              </div>
                            ) : hrmsUsers.length === 0 ? (
                              <CommandEmpty className="p-4 text-sm text-center text-muted-foreground font-medium">
                                No exact match. Using "{searchTerm}" as name.
                              </CommandEmpty>
                            ) : (
                              <CommandGroup heading="Suggestions from HRMS">
                                {hrmsUsers.map((user) => (
                                  <CommandItem
                                    key={user.emp_id}
                                    value={user.emp_id}
                                    onSelect={() => handleHrmsSelect(user)}
                                    className="flex flex-col items-start gap-1 py-3 px-4 cursor-pointer hover:bg-primary/5 rounded-lg mx-1"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-bold text-sm">{user.name}</span>
                                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                        {user.emp_id}
                                      </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate w-full">{user.email}</span>
                                    <span className="text-[10px] text-primary/60 uppercase font-bold tracking-widest">{user.department_name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john@zyre.link" className="rounded-xl border-primary/20 bg-background focus-visible:ring-primary h-11" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full h-11 rounded-xl border border-primary/20 bg-background px-3 text-sm font-medium focus:ring-1 ring-primary outline-none transition-all"
                      >
                        {Object.values(UserRole).map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ZY-001" className="rounded-xl border-primary/20 bg-background focus-visible:ring-primary h-11" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Engineering" className="rounded-xl border-primary/20 bg-background focus-visible:ring-primary h-11" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border-primary/20 hover:bg-primary/5 font-bold h-11"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 rounded-xl shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
