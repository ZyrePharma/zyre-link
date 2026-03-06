"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Lock,
  Unlock,
  Link as LinkIcon,
  Unlink,
  Trash2,
  Loader2,
  CreditCard,
  StickyNote,
} from "lucide-react";

type Card = {
  id: string;
  cardUid: string;
  isActivated: boolean;
  isLocked: boolean;
  isDeactivated: boolean;
  notes: string | null;
  assignedAt: Date | null;
  createdAt: Date;
  user: { id: string; name: string | null; email: string } | null;
  profile: { username: string | null } | null;
};

type SystemUser = { id: string; name: string | null; email: string };

export function CardActions({ card }: { card: Card }) {
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [notesValue, setNotesValue] = useState(card.notes || "");
  const [editForm, setEditForm] = useState({
    cardUid: card.cardUid,
    notes: card.notes || "",
  });

  // Fetch users for assignment dropdown
  useEffect(() => {
    if (!assignOpen) return;
    fetch("/api/admin/users/list")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [assignOpen]);

  const patch = async (body: object) => {
    const res = await fetch(`/api/admin/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const handleToggleLock = async () => {
    try {
      await patch({ isLocked: !card.isLocked });
      toast.success(card.isLocked ? "Card unlocked." : "Card locked.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAssign = async () => {
    setIsLoading(true);
    try {
      await patch({ userId: selectedUserId || null });
      toast.success(selectedUserId ? "Card assigned." : "Card unassigned.");
      setAssignOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    try {
      await patch({ notes: notesValue });
      toast.success("Notes saved.");
      setNotesOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/cards/${card.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Card deleted.");
      setDeleteOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      await patch(editForm);
      toast.success("Card updated.");
      setEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
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
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-primary/10">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Card Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setViewOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <Eye className="h-4 w-4 text-primary/60" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAssignOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <LinkIcon className="h-4 w-4 text-primary/60" /> Assign User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <CreditCard className="h-4 w-4 text-primary/60" /> Edit Card
          </DropdownMenuItem>
          {card.user && (
            <DropdownMenuItem onClick={() => patch({ userId: null }).then(() => { toast.success("Card unassigned."); router.refresh(); }).catch((e) => toast.error(e.message))} className="gap-2 cursor-pointer rounded-lg">
              <Unlink className="h-4 w-4 text-amber-500" /> Unassign
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleToggleLock} className="gap-2 cursor-pointer rounded-lg">
            {card.isLocked
              ? <><Unlock className="h-4 w-4 text-green-500" />Unlock Card</>
              : <><Lock className="h-4 w-4 text-amber-500" />Lock Card</>
            }
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNotesOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <StickyNote className="h-4 w-4 text-primary/60" /> Edit Notes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="gap-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Delete Card
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-primary/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b] -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <CreditCard className="h-5 w-5 text-primary" />
              Card Details
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">{card.cardUid}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: "Type", value: "Standard" },
              { label: "Status", value: card.isActivated ? <Badge variant={"success" as any} className="rounded-full text-xs">ACTIVATED</Badge> : <Badge variant="secondary" className="rounded-full text-xs">PENDING</Badge> },
              { label: "Locked", value: card.isLocked ? <span className="text-red-500 font-bold text-xs">YES</span> : <span className="text-green-500 font-bold text-xs">NO</span> },
              { label: "Deactivated", value: card.isDeactivated ? <span className="text-red-500 font-bold text-xs">YES</span> : <span className="text-green-500 font-bold text-xs">NO</span> },
              { label: "Assigned To", value: card.user?.name || "Unassigned" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/40 rounded-xl p-3 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <div className="text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
          {card.notes && (
            <div className="bg-muted/40 rounded-xl p-3 mt-2 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="text-sm">{card.notes}</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Registered {new Date(card.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </DialogContent>
      </Dialog>

      {/* ASSIGN DIALOG */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-primary/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b] -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Assign Card</DialogTitle>
            <DialogDescription>Select a user to assign this card to.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full h-11 rounded-xl border border-primary/20 bg-background px-3 text-sm font-medium focus:ring-1 ring-primary outline-none"
            >
              <option value="">— Unassign (remove user) —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {card.user && (
              <p className="text-xs text-muted-foreground">
                Currently assigned to: <strong>{card.user.name}</strong>
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setAssignOpen(false)} className="flex-1 rounded-xl h-11 border-primary/20 font-bold">Cancel</Button>
            <Button onClick={handleAssign} disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* NOTES DIALOG */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-primary/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b] -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Card Notes</DialogTitle>
            <DialogDescription>Add internal notes for this card.</DialogDescription>
          </DialogHeader>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="e.g. Replacement card issued on Mar 2025..."
            rows={4}
            className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm focus:ring-1 ring-primary outline-none resize-none"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setNotesOpen(false)} className="flex-1 rounded-xl h-11 border-primary/20 font-bold">Cancel</Button>
            <Button onClick={handleSaveNotes} disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Notes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-2xl border-destructive/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-700 -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">Delete Card</DialogTitle>
            <DialogDescription>
              This will permanently remove card <strong className="font-mono">{card.cardUid}</strong> from the system. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 rounded-xl h-11 border-primary/20 font-bold">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT CARD DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-primary/20 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#0f1c48] to-[#c0392b] -mt-6 -mx-6 mb-4 rounded-t-2xl" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Card</DialogTitle>
            <DialogDescription>Update the card serial number and notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Serial Number (UID)</label>
              <input
                value={editForm.cardUid}
                onChange={(e) => setEditForm(prev => ({ ...prev, cardUid: e.target.value }))}
                className="w-full h-11 rounded-xl border border-primary/20 bg-background px-4 text-sm font-mono focus:ring-1 ring-primary outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Internal Notes</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm focus:ring-1 ring-primary outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-xl h-11 border-primary/20 font-bold">Cancel</Button>
            <Button onClick={handleEdit} disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
