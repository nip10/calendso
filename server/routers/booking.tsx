import { createRouter } from "../createRouter";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const bookingRouter = createRouter().query("userAndEventType", {
  input: z.string(),
  async resolve({ input, ctx }) {
    const user = await ctx.prisma.user.findUnique({
      where: {
        username: input,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        theme: true,
        plan: true,
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const eventTypesWithHidden = await ctx.prisma.eventType.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        length: true,
        description: true,
        hidden: true,
      },
      take: user.plan === "FREE" ? 1 : undefined,
    });
    const eventTypes = eventTypesWithHidden.filter((evt) => !evt.hidden);
    return {
      user,
      eventTypes,
    };
  },
});