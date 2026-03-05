import path from "path";
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    // You can use ts-node or tsx to run the seed file
    seed: 'npx tsx ./prisma/seed.ts',
  },
});