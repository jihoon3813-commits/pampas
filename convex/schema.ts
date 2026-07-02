import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
