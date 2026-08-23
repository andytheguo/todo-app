import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export function setupTokenCleanup() {
  cron.schedule("0 0 * * *", async () => {
    await prisma.refreshToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });

    console.log("Ran cleanup");
  });
}
