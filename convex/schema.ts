import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.string(),
    zipcode: v.optional(v.string()),
    address: v.optional(v.string()),
    detailAddress: v.optional(v.string()),
    role: v.optional(v.string()), // 'user' | 'admin'
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  consultations: defineTable({
    userName: v.string(),
    userPhone: v.string(),
    interestBenefit: v.string(),
    consultTime: v.string(),
    status: v.optional(v.string()), // '대기중', '상담진행중', etc.
    date: v.string(),
  }),
  inquiries: defineTable({
    userName: v.string(),
    userPhone: v.string(),
    message: v.string(),
    status: v.optional(v.string()), // '대기중', '처리중', '답변완료', '접수취소'
    date: v.string(),
  }),
});
