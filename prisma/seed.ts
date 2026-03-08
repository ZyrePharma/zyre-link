import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@zyre.com" },
    update: {},
    create: {
      email: "admin@zyre.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  // Create Employee with Profile
  const employeePassword = await bcrypt.hash("user123", 12);
  const employee = await prisma.user.upsert({
    where: { email: "john.doe@zyre.com" },
    update: {},
    create: {
      email: "john.doe@zyre.com",
      name: "John Doe",
      password: employeePassword,
      role: "EMPLOYEE",
      employeeId: "Z-10042",
      department: "Engineering",
      isActive: true,
      profile: {
        create: {
          username: "jdoe",
          firstName: "John",
          lastName: "Doe",
          jobTitle: "Senior Software Engineer",
          department: "Engineering",
          bio: "Building the future of digital connectivity at Zyre Link. Focused on scalability and user experience.",
          officeLocation: "Kuala Lumpur HQ",
          teamName: "Core Platform",
          extension: "102",
          contactMethods: {
            create: [
              { type: "EMAIL", value: "john.doe@zyre.com", label: "Work", isPrimary: true },
              { type: "PHONE", value: "+60 12-345-6789", label: "Mobile", isPrimary: true },
            ],
          },
          socialLinks: {
            create: [
              { platform: "linkedin", url: "https://linkedin.com/in/johndoe" },
              { platform: "github", url: "https://github.com/johndoe" },
            ],
          },
          customLinks: {
            create: [
              { title: "Portfolio", url: "https://johndoe.com", description: "My personal projects" },
            ],
          },
        },
      },
    },
  });


  console.log({ admin: admin.email, employee: employee.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
