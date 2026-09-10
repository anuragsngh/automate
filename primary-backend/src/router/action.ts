import { Router } from "express";
import { prismaClient } from "../db";

const router = Router();

router.get("/available", async (req, res) => {
  try {
    const availableActions = await prismaClient.availableAction.findMany({});
    return res.json({
      availableActions
    });
  } catch (error) {
    console.error("Error fetching available actions:", error);
    return res.status(500).json({
      message: "Failed to fetch actions",
      error: String(error)
    });
  }
});

export const actionRouter = router;
