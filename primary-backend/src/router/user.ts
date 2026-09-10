import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import { JWT_PASSWORD } from "../config";

const router = Router();

router.post("/signup", async (req, res) => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
      errors: parsedData.error.errors
    });
  }

  const existingUser = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username
    }
  });

  if (existingUser) {
    return res.status(403).json({
      message: "User already exists with this email"
    });
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

  const newUser = await prismaClient.user.create({
    data: {
      email: parsedData.data.username,
      password: hashedPassword,
      name: parsedData.data.name
    }
  });

  const token = jwt.sign(
    {
      id: newUser.id
    },
    JWT_PASSWORD
  );

  return res.json({
    message: "User signed up successfully",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

router.post("/signin", async (req, res) => {
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
      errors: parsedData.error.errors
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username
    }
  });

  if (!user) {
    return res.status(403).json({
      message: "Invalid email or password"
    });
  }

  const isPasswordValid = await bcrypt.compare(
    parsedData.data.password,
    user.password
  );

  const isPlainMatch = user.password === parsedData.data.password;

  if (!isPasswordValid && !isPlainMatch) {
    return res.status(403).json({
      message: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    {
      id: user.id
    },
    JWT_PASSWORD
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = req.id;

  if (!id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  return res.json({
    user
  });
});

export const userRouter = router;
