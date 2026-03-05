import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  earlyAccess: true,
  studio: {
    hostname: "localhost",
    port: 5555,
  },
  queryEngine: {
    // Add logic to connect conditionally if needed, but db push requires a static url for now
  }
});