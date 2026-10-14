import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.string(),
    zipcode: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      return { success: false, message: "이미 가입된 이메일 주소입니다." };
    }

    const userId = await ctx.db.insert("users", {
      email,
      password: args.password,
      name: args.name.trim(),
      phone: args.phone.trim(),
      zipcode: args.zipcode ? args.zipcode.trim() : undefined,
      address: args.address ? args.address.trim() : undefined,
      detailAddress: args.detailAddress ? args.detailAddress.trim() : undefined,
      role: "user",
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: {
        id: userId,
        email,
        name: args.name.trim(),
        phone: args.phone.trim(),
        address: args.address || "",
        detailAddress: args.detailAddress || "",
      },
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return { success: false, message: "가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다." };
    }

    if (user.password !== args.password) {
      return { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    return {
      success: true,
      message: "로그인되었습니다.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address || "",
        detailAddress: user.detailAddress || "",
        role: user.role || "user",
      },
    };
  },
});

export const getMe = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address || "",
      detailAddress: user.detailAddress || "",
      role: user.role || "user",
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
