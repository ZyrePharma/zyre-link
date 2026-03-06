"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  UserCheck,
  UserX,
  Shield,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "@prisma/client";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  department: string | null;
  employeeId: string | null;
  isActive: boolean;
  createdAt: Date;
  profile?: { username: string | null; jobTitle: string | null } | null;
};

export function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    role: user.role,
    department: user.department || "",
    employeeId: user.employeeId || "",
    isActive: user.isActive,
  });

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("User updated successfully.");
      setEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("User deleted.");
      setDeleteOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success(user.isActive ? "User deactivated." : "User activated.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-primary/10">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setViewOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <Eye className="h-4 w-4 text-primary/60" />
            View Details
          </DropdownMenuItem>
          {user.profile?.username && (
            <DropdownMenuItem onClick={() => window.open(`/profile/${user.profile?.username}`, "_blank")} className="gap-2 cursor-pointer rounded-lg">
              <ExternalLink className="h-4 w-4 text-primary/60" />
              View Public Profile
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/profile`)} className="gap-2 cursor-pointer rounded-lg">
            <Pencil className="h-4 w-4 text-primary/60" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <Pencil className="h-4 w-4 text-primary/60" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive} className="gap-2 cursor-pointer rounded-lg">
            {user.isActive
              ? <><UserX className="h-4 w-4 text-amber-500" />Deactivate</>
              : <><UserCheck className="h-4 w-4 text-green-500" />Activate</>
            }
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="gap-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-primary/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b] -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{user.name}</DialogTitle>
            <DialogDescription>{user.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Role", value: <div className="flex items-center gap-1">{user.role === "ADMIN" && <Shield className="h-3 w-3 text-red-500" />}<span className="font-bold text-xs">{user.role}</span></div> },
                { label: "Status", value: <Badge variant={user.isActive ? "success" : "secondary" as any} className="rounded-full text-xs font-bold">{user.isActive ? "ACTIVE" : "INACTIVE"}</Badge> },
                { label: "Department", value: user.department || "—" },
                { label: "Employee ID", value: user.employeeId || "—" },
                { label: "Username", value: user.profile?.username ? `@${user.profile.username}` : "—" },
                { label: "Job Title", value: user.profile?.jobTitle || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/40 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-primary/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b] -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
            <DialogDescription>Update details for {user.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
              { label: "Department", key: "department", type: "text", placeholder: "Engineering" },
              { label: "Employee ID", key: "employeeId", type: "text", placeholder: "ZY-001" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
                <Input
                  type={type}
                  placeholder={placeholder}
                  value={(editForm as any)[key]}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="h-11 rounded-xl border-primary/20 bg-background focus-visible:ring-primary"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full h-11 rounded-xl border border-primary/20 bg-background px-3 text-sm font-medium focus:ring-1 ring-primary outline-none"
              >
                {Object.values(UserRole).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-bold">Account Active</p>
                <p className="text-xs text-muted-foreground">User can log in when active</p>
              </div>
              <button
                type="button"
                onClick={() => setEditForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editForm.isActive ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  editForm.isActive ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-xl h-11 border-primary/20 font-bold">
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-2xl border-destructive/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-700 -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{user.name}</strong> and all their data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 rounded-xl h-11 border-primary/20 font-bold">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 rounded-xl h-11 font-bold"
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
