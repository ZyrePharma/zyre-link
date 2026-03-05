import { prisma } from "@/lib/prisma";
import { InviteUserDialog } from "@/components/forms/invite-user-dialog";
import { DataTable } from "@/components/ui/data-table";
import { userColumns } from "@/components/admin/users-columns";

export default async function EmployeeManagementPage() {
  const users = await prisma.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  const data = users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    employeeId: u.employeeId,
    isActive: u.isActive,
    inviteToken: u.inviteToken,
    createdAt: u.createdAt,
    profile: u.profile ? { username: u.profile.username, jobTitle: u.profile.jobTitle } : null,
  }));

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage user accounts, roles, and profile statuses.</p>
        </div>
        <InviteUserDialog />
      </div>

      <DataTable
        columns={userColumns}
        data={data}
        searchPlaceholder="Search by name, email, department..."
      />
    </div>
  );
}
