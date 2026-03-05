"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CardActions } from "@/components/admin/card-actions";
import { Lock, StickyNote } from "lucide-react";

export type CardRow = {
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

export const cardColumns: ColumnDef<CardRow>[] = [
  {
    id: "cardInfo",
    accessorFn: (row) => `${row.cardUid}`,
    header: "Card Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold font-mono text-foreground text-sm">{row.original.cardUid}</span>
        {row.original.notes && (
          <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium mt-0.5">
            <StickyNote className="h-3 w-3" /> Has notes
          </span>
        )}
      </div>
    ),
  },
  {
    id: "assignedTo",
    accessorFn: (row) => row.user?.name ?? "Unassigned",
    header: "Assigned To",
    cell: ({ row }) =>
      row.original.user ? (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.user.name}</span>
          <span className="text-xs text-muted-foreground">@{row.original.profile?.username}</span>
        </div>
      ) : (
        <span className="text-sm italic text-muted-foreground">Unassigned</span>
      ),
  },
  {
    id: "status",
    accessorFn: (row) =>
      row.isDeactivated ? "DISABLED" : row.isLocked ? "LOCKED" : row.isActivated ? "ACTIVATED" : "PENDING",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge
          variant={row.original.isActivated ? "success" : "secondary" as any}
          className="rounded-full font-bold px-3"
        >
          {row.original.isActivated ? "ACTIVATED" : "PENDING"}
        </Badge>
        {row.original.isLocked && <Lock className="h-3 w-3 text-red-500" />}
        {row.original.isDeactivated && (
          <Badge variant="destructive" className="rounded-full font-bold px-2 text-[10px]">DISABLED</Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CardActions card={row.original} />
      </div>
    ),
    enableSorting: false,
  },
];
