import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MousePointerClick, Share2, QrCode } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      profile: {
        include: {
          _count: {
            select: { views: true }
          }
        }
      }
    }
  });

  const profile = user?.profile;

  if (!profile) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Welcome, {session?.user?.name}!</h1>
        <Card className="p-4 md:p-6">
          <p className="text-muted-foreground mb-4">You haven't set up your digital business card yet.</p>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
            <Link href="/dashboard/edit-profile">Create Your Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
            <Link href={`/profile/${profile.username}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              View Card
            </Link>
          </Button>
          <Button size="sm" className="text-xs md:text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Share2 className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
            Share Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Views</CardTitle>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{profile._count.views}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">+0 since last week</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Link Clicks</CardTitle>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <MousePointerClick className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">0</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">+0 since last week</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">QR Scans</CardTitle>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <QrCode className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">0</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Internal tracking</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Card Status</CardTitle>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">Active</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Visible to company</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <Card className="lg:col-span-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] md:h-[300px] flex items-center justify-center border-t">
            <p className="text-muted-foreground italic text-sm">Chart will be implemented with Recharts</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Active NFC Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-center py-6 md:py-8">
              <p className="text-muted-foreground">No active physical cards linked.</p>
              <Button variant="outline" size="sm" asChild className="border-secondary/30 text-secondary hover:bg-secondary/10">
                <Link href="/nfc/activate">Link New Card</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
