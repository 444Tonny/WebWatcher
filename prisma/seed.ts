import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const sites = [
  {
    name: "WebWatcher Docs",
    url: "https://docs.webwatcher.dev",
    status: "up",
    responseTime: 128,
    lastCheck: new Date(),
  },
  {
    name: "Acme Corp",
    url: "https://acme.example.com",
    status: "up",
    responseTime: 245,
    lastCheck: new Date(),
  },
  {
    name: "Northwind Traders",
    url: "https://northwind.example.com",
    status: "down",
    responseTime: null,
    lastCheck: new Date(),
  },
  {
    name: "Globex API",
    url: "https://api.globex.example.com",
    status: "degraded",
    responseTime: 980,
    lastCheck: new Date(),
  },
  {
    name: "Initech Portal",
    url: "https://portal.initech.example.com",
    status: "unknown",
    responseTime: null,
    lastCheck: null,
  },
];

async function main() {
  for (const site of sites) {
    await prisma.site.upsert({
      where: { url: site.url },
      update: site,
      create: site,
    });
  }
  console.log(`Seeded ${sites.length} sites.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
