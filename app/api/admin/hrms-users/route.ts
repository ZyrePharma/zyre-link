import { queryHrms } from "@/lib/hrms-db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    if (!search) {
      return NextResponse.json([]);
    }

    let query = `
      SELECT 
        u.emp_id, 
        u.name, 
        u.email, 
        u.position, 
        d.name as department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.deleted_at IS NULL 
        AND u.resigned_at IS NULL
        AND u.company_id IN (1, 2)
    `;
    
    const params: any[] = [];
    
    if (search) {
      query += ` AND (u.name LIKE ? OR u.emp_id LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY u.name ASC LIMIT 50`;

    const rows = await queryHrms(query, params);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("[ADMIN_HRMS_USERS_GET]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
