import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const client = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "hooks" });
});

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const { userId, zapId } = req.params;
  const body = req.body;

  try {
    const zap = await client.zap.findFirst({
      where: {
        id: zapId,
        userId: parseInt(userId, 10)
      }
    });

    if (!zap) {
      return res.status(404).json({
        message: "Automation not found for this user"
      });
    }

    const run = await client.$transaction(async (tx) => {
      const zapRun = await tx.zapRun.create({
        data: {
          zapId: zapId,
          metadata: body
        }
      });

      await tx.zapRunOutbox.create({
        data: {
          zapRunId: zapRun.id
        }
      });

      return zapRun;
    });

    console.log(`[Hooks] Webhook received for Zap ${zapId}, ZapRun: ${run.id}`);

    return res.status(200).json({
      message: "Webhook received",
      zapRunId: run.id
    });
  } catch (error) {
    console.error("[Hooks] Error handling webhook:", error);
    return res.status(500).json({
      message: "Internal server error while processing webhook",
      error: String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Hooks service listening on port ${PORT}`);
});
