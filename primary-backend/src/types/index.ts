import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

export const SigninSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6)
});

export const ZapCreateSchema = z.object({
  availableTriggerId: z.string(),
  triggerMetadata: z.any().optional().default({}),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: z.any().optional().default({})
    })
  )
});
