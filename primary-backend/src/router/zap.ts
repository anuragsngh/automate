import { Router } from "express";
import { AuthenticatedRequest, authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.id;
  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
      errors: parsedData.error.errors
    });
  }

  try {
    const zapId = await prismaClient.$transaction(async (tx) => {

      const zap = await tx.zap.create({
        data: {
          userId,
          triggerId: "",
          actions: {
            create: parsedData.data.actions.map((action, index) => ({
              actionId: action.availableActionId,
              sortingOrder: index,
              metadata: action.actionMetadata || {}
            }))
          }
        }
      });

      const trigger = await tx.trigger.create({
        data: {
          triggerId: parsedData.data.availableTriggerId,
          zapId: zap.id,
          metadata: parsedData.data.triggerMetadata || {}
        }
      });

      await tx.zap.update({
        where: { id: zap.id },
        data: { triggerId: trigger.id }
      });

      return zap.id;
    });

    return res.json({
      message: "Automation created successfully",
      zapId
    });
  } catch (error) {
    console.error("Error creating Automation:", error);
    return res.status(500).json({
      message: "Failed to create Automation",
      error: String(error)
    });
  }
});

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.id;
  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const zaps = await prismaClient.zap.findMany({
      where: {
        userId
      },
      include: {
        actions: {
          include: {
            type: true
          },
          orderBy: {
            sortingOrder: "asc"
          }
        },
        trigger: {
          include: {
            type: true
          }
        },
        zapRuns: {
          take: 5,
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      zaps
    });
  } catch (error) {
    console.error("Error fetching Zaps:", error);
    return res.status(500).json({
      message: "Failed to fetch Zaps",
      error: String(error)
    });
  }
});

router.get("/:zapId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.id;
  const zapId = req.params.zapId;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const zap = await prismaClient.zap.findFirst({
      where: {
        id: zapId,
        userId
      },
      include: {
        actions: {
          include: {
            type: true
          },
          orderBy: {
            sortingOrder: "asc"
          }
        },
        trigger: {
          include: {
            type: true
          }
        },
        zapRuns: {
          take: 20,
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!zap) {
      return res.status(404).json({
        message: "Automation not found"
      });
    }

    return res.json({
      zap
    });
  } catch (error) {
    console.error("Error fetching Automation details:", error);
    return res.status(500).json({
      message: "Failed to fetch Automation",
      error: String(error)
    });
  }
});

router.delete("/:zapId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.id;
  const zapId = req.params.zapId;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const zap = await prismaClient.zap.findFirst({
      where: {
        id: zapId,
        userId
      }
    });

    if (!zap) {
      return res.status(404).json({ message: "Automation not found" });
    }

    await prismaClient.zap.delete({
      where: { id: zapId }
    });

    return res.json({
      message: "Automation deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting Automation:", error);
    return res.status(500).json({
      message: "Failed to delete Automation",
      error: String(error)
    });
  }
});

router.post("/:zapId/trigger", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.id;
  const zapId = req.params.zapId;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const zap = await prismaClient.zap.findFirst({
      where: {
        id: zapId,
        userId
      },
      include: {
        trigger: {
          include: {
            type: true
          }
        },
        user: true
      }
    });

    if (!zap) {
      return res.status(404).json({ message: "Automation not found" });
    }

    const triggerMetadata = (zap.trigger?.metadata || {}) as Record<string, any>;
    const bodyMetadata = req.body?.metadata || req.body || {};

    const initialMetadata = {
      source: zap.trigger?.type?.id || "manual-trigger",
      event: {
        summary: triggerMetadata.eventTitle || "Weekly AI Digest",
        start: new Date().toISOString(),
        description: "Triggered execution for AI weekly digest"
      },
      recipientEmail: triggerMetadata.recipientEmail || zap.user.email,
      ...bodyMetadata
    };

    const run = await prismaClient.$transaction(async (tx) => {
      const zapRun = await tx.zapRun.create({
        data: {
          zapId: zap.id,
          metadata: initialMetadata
        }
      });

      await tx.zapRunOutbox.create({
        data: {
          zapRunId: zapRun.id
        }
      });

      return zapRun;
    });

    console.log(`[Zap Trigger] Manually queued ZapRun ${run.id} for Zap ${zapId}`);

    return res.json({
      message: "Automation triggered successfully",
      zapRunId: run.id
    });
  } catch (error) {
    console.error("Error triggering Automation:", error);
    return res.status(500).json({
      message: "Failed to trigger Automation",
      error: String(error)
    });
  }
});

export const zapRouter = router;
