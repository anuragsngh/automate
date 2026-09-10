import express from "express";
import cors from "cors";
import { userRouter } from "./router/user";
import { zapRouter } from "./router/zap";
import { triggerRouter } from "./router/trigger";
import { actionRouter } from "./router/action";
import { PORT } from "./config";
import { prismaClient } from "./db";
import { startBackgroundEngine } from "./worker/runner";
import { sendEmail } from "./worker/email";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "primary-backend" });
});

app.get("/test-email", async (req, res) => {
  const to = (req.query.to as string) || "2615anuragsngh@gmail.com";
  const result = await sendEmail(to, `Live test verification at ${new Date().toISOString()}`, "Live Automate Cloud Test");
  res.json({ result, timestamp: new Date().toISOString() });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);
app.use("/api/v1/trigger", triggerRouter);
app.use("/api/v1/action", actionRouter);

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const { userId, zapId } = req.params;
  const body = req.body;

  try {
    const zap = await prismaClient.zap.findFirst({
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

    const run = await prismaClient.$transaction(async (tx) => {
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

    return res.status(200).json({
      message: "Webhook received",
      zapRunId: run.id
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while processing webhook",
      error: String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Primary Backend is running on port ${PORT}`);
  startBackgroundEngine(prismaClient);
});
