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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, {session?.user?.name}!</h1>
        <Card className="p-6">
          <p className="text-gray-600 mb-4">You haven't set up your digital business card yet.</p>
          <Button asChild>
            <Link href="/dashboard/edit-profile">Create Your Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/profile/${profile.username}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Public Card
            </Link>
          </Button>
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Share Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile._count.views}</div>
            <p className="text-xs text-muted-foreground">+0 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Internal tracking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Status</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Visible to company</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t">
            <p className="text-gray-400 italic">Chart will be implemented with Recharts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active NFC Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-center py-8">
              <p className="text-gray-500">No active physical cards linked.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/nfc/activate">Link New Card</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
