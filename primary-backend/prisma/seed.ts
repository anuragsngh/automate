import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Available Triggers
  await prismaClient.availableTrigger.upsert({
    where: { id: "webhook" },
    update: {
      name: "Webhook",
      image: "https://cdn.iconscout.com/icon/free/png-512/free-webhook-icon-download-in-svg-png-gif-file-formats--api-code-technology-webhooks-web-development-pack-icons-5015609.png?f=webp&w=256"
    },
    create: {
      id: "webhook",
      name: "Webhook",
      image: "https://cdn.iconscout.com/icon/free/png-512/free-webhook-icon-download-in-svg-png-gif-file-formats--api-code-technology-webhooks-web-development-pack-icons-5015609.png?f=webp&w=256"
    }
  });

  await prismaClient.availableTrigger.upsert({
    where: { id: "google-calendar" },
    update: {
      name: "Google Calendar Event",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
    },
    create: {
      id: "google-calendar",
      name: "Google Calendar Event",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
    }
  });

  // Clean up removed actions if existing
  try {
    await prismaClient.availableAction.deleteMany({
      where: { id: "send-sol" }
    });
  } catch (err) {
    // Ignore if not present or in use by legacy zaps
  }

  // Seed Available Actions
  await prismaClient.availableAction.upsert({
    where: { id: "email" },
    update: {
      name: "Send Email",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
    },
    create: {
      id: "email",
      name: "Send Email",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
    }
  });

  await prismaClient.availableAction.upsert({
    where: { id: "ai-agent" },
    update: {
      name: "AI Agent Researcher",
      image: "https://cdn-icons-png.flaticon.com/512/8649/8649595.png"
    },
    create: {
      id: "ai-agent",
      name: "AI Agent Researcher",
      image: "https://cdn-icons-png.flaticon.com/512/8649/8649595.png"
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
