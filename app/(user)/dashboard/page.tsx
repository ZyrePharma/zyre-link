import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MousePointerClick, Share2, QrCode, CreditCard } from "lucide-react";
import Link from "next/link";
import { type NfcCard } from "@prisma/client";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ShareButton } from "@/components/dashboard/share-button";
import { subDays, startOfDay, format, isSameDay } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      profile: {
        include: {
          _count: {
            select: { 
              views: true,
            }
          },
          views: {
            select: {
              sourceType: true
            }
          }
        }
      },
      nfcCards: true,
    }
  });

  const profile = user?.profile;
  const activeNfcCards = user?.nfcCards?.filter(card => card.isActivated && !card.isDeactivated) || [];

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

  const totalViews = profile?._count?.views || 0;
  const totalQrScans = profile?.views?.filter(v => v.sourceType === "QR").length || 0;
  const totalNfcTaps = profile?.views?.filter(v => v.sourceType === "NFC").length || 0;

  // Fetch last 7 days of activity data
  const startOf7DaysAgo = startOfDay(subDays(new Date(), 6));
  
  const [dailyViews, dailyClicks, lastWeekViews, lastWeekTaps] = await Promise.all([
    prisma.profileView.findMany({
      where: {
        profileId: profile.id,
        viewedAt: { gte: startOf7DaysAgo }
      },
      select: { viewedAt: true }
    }),
    prisma.linkClick.findMany({
      where: {
        profileId: profile.id,
        clickedAt: { gte: startOf7DaysAgo }
      },
      select: { clickedAt: true, linkType: true }
    }),
    prisma.profileView.count({
      where: {
        profileId: profile.id,
        viewedAt: { gte: startOf7DaysAgo }
      }
    }),
    prisma.profileView.count({
      where: {
        profileId: profile.id,
        viewedAt: { gte: startOf7DaysAgo },
        sourceType: "NFC"
      }
    })
  ]);

  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const dayStr = format(day, "MMM dd");
    
    const viewsCount = dailyViews.filter(v => isSameDay(v.viewedAt, day)).length;
    const clicksCount = dailyClicks.filter(c => isSameDay(c.clickedAt, day)).length;
    
    return {
      date: dayStr,
      views: viewsCount,
      taps: clicksCount,
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" size="sm" asChild className="text-xs md:text-sm bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/profile/${profile.username}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              View Profile
            </Link>
          </Button>
          <ShareButton 
            username={profile.username} 
            name={`${profile.firstName} ${profile.lastName}`} 
          />
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
            <div className="text-lg md:text-2xl font-bold">{totalViews}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">+{lastWeekViews} since last week</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Card Taps</CardTitle>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <MousePointerClick className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{totalNfcTaps}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">+{lastWeekTaps} since last week</p>
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
            <div className="text-lg md:text-2xl font-bold">{totalQrScans}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Scanned via QR Code</p>
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
          <CardContent className="h-[200px] md:h-[300px] p-0 md:p-6 md:pt-2">
            <ActivityChart data={activityData} />
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
            {activeNfcCards.length > 0 ? (
              <div className="space-y-4">
                {activeNfcCards.map((card: NfcCard) => (
                  <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Physical Card</p>
                        <p className="text-xs text-muted-foreground font-mono">{card.cardUid}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-medium text-right">Active</span>
                    </div>
                  </div>
                ))}
              
              </div>
            ) : (
              <div className="space-y-4 text-sm text-center py-6 md:py-8">
                <p className="text-muted-foreground">No active physical cards linked.</p>
                
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
