"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";
import { Shield } from "lucide-react";
import { UserRole } from "@prisma/client";

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  department: string | null;
  employeeId: string | null;
  isActive: boolean;
  inviteToken: string | null;
  createdAt: Date;
  profile: { username: string | null; jobTitle: string | null } | null;
};

export const userColumns: ColumnDef<UserRow>[] = [
  {
    id: "employee",
    accessorFn: (row) => `${row.name} ${row.email}`,
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "employeeId",
    header: "Employee ID",
    cell: ({ getValue }) => (
      <span className="text-sm font-mono text-muted-foreground">
        {(getValue() as string) || "—"}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.role === "ADMIN" && <Shield className="h-3 w-3 text-red-500" />}
        <span className="text-sm font-medium">{row.original.role}</span>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {(getValue() as string) || "Unassigned"}
      </span>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => (row.inviteToken ? "INVITE PENDING" : row.isActive ? "ACTIVE" : "INACTIVE"),
    header: "Status",
    cell: ({ row }) => {
      if (row.original.inviteToken) {
        return (
          <Badge variant="outline" className="rounded-full font-bold px-3 border-amber-400 text-amber-600 bg-amber-50">
            INVITE PENDING
          </Badge>
        );
      }
      return (
        <Badge
          variant={row.original.isActive ? "success" : "secondary" as any}
          className="rounded-full font-bold px-3"
        >
          {row.original.isActive ? "ACTIVE" : "INACTIVE"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserActions user={row.original} />
      </div>
    ),
    enableSorting: false,
  },
];
