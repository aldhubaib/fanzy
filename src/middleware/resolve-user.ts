import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";

import { prisma } from "../lib/db.js";

declare global {
  namespace Express {
    interface Request {
      dbUser?: {
        id: string;
        clerkId: string;
        email: string;
        name: string | null;
      };
    }
  }
}

export async function resolveUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ ok: false, error: "Not authenticated" });
      return;
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!dbUser) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const email =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        res.status(400).json({ ok: false, error: "No email on Clerk account" });
        return;
      }

      dbUser = await prisma.user.create({
        data: {
          clerkId: auth.userId,
          email,
          name:
            clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName ?? null,
        },
      });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve user";
    res.status(500).json({ ok: false, error: message });
  }
}
