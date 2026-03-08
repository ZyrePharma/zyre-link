import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import os from "os";

export async function GET() {
  try {
    // Check DB connection
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStartTime;

    // Get system metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = Math.round((usedMem / totalMem) * 100);

    const uptime = os.uptime(); // in seconds
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const uptimeString = days > 0 
      ? `${days}d ${hours}h ${minutes}m`
      : hours > 0 
        ? `${hours}h ${minutes}m`
        : `${minutes}m`;

    return NextResponse.json({
      status: "healthy",
      database: {
        status: "connected",
        latency: `${dbLatency}ms`
      },
      system: {
        memoryUsage: `${memUsage}%`,
        uptime: uptimeString,
        loadAvg: os.loadavg()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health Check Error:", error);
    return NextResponse.json({ 
      status: "degraded",
      error: "Database connection failed" 
    }, { status: 500 });
  }
}
