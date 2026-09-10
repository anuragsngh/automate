import { Router } from "express";
import { prismaClient } from "../db";

const router = Router();

router.get("/available", async (req, res) => {
  try {
    const availableTriggers = await prismaClient.availableTrigger.findMany({});
    return res.json({
      availableTriggers
    });
  } catch (error) {
    console.error("Error fetching available triggers:", error);
    return res.status(500).json({
      message: "Failed to fetch triggers",
      error: String(error)
    });
  }
});

export const triggerRouter = router;
