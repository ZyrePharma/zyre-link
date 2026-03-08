import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, TrendingUp } from "lucide-react";
import { ActivityChart } from "@/components/admin/activity-chart";
import { SystemHealth } from "@/components/admin/system-health";

export default async function AdminDashboardPage() {
  const userCount = await prisma.user.count();
  const profileCount = await prisma.profile.count();
  const cardCount = await prisma.nfcCard.count();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const activityData = await Promise.all(
    last7Days.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const [views, clicks] = await Promise.all([
        prisma.profileView.count({
          where: { viewedAt: { gte: date, lt: nextDate } },
        }),
        prisma.linkClick.count({
          where: { clickedAt: { gte: date, lt: nextDate } },
        }),
      ]);

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        views,
        clicks,
      };
    })
  );

  const stats = [
    { label: "Total Employees", value: userCount, icon: Users, color: "text-primary", accent: "bg-primary/10" },
    { label: "Active Profiles", value: profileCount, icon: Activity, color: "text-secondary", accent: "bg-secondary/10" },
    { label: "NFC Cards Issued", value: cardCount, icon: CreditCard, color: "text-amber-500", accent: "bg-amber-500/10" },
    { label: "Recent Views", value: "1.2k", icon: TrendingUp, color: "text-emerald-500", accent: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-primary/10 shadow-sm hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{stat.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.accent} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 md:gap-6">
        <Card className="lg:col-span-4 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activityData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemHealth />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
