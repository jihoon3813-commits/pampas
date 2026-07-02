import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userName: v.string(),
    userPhone: v.string(),
    message: v.string(),
    status: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      userName: args.userName,
      userPhone: args.userPhone,
      message: args.message,
      status: args.status || "대기중",
      date: args.date,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inquiries").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: {
    id: v.id("inquiries"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("inquiries").collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
  },
});
