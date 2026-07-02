import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PATCH",
  "Access-Control-Allow-Headers": "Content-Type",
};

const handleOptions = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
});

// 1. Consultations
http.route({
  path: "/submitConsultation",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { userName, userPhone, interestBenefit, consultTime, date } = await request.json();
    await ctx.runMutation(api.consultations.create, {
      userName,
      userPhone,
      interestBenefit,
      consultTime,
      status: "대기중",
      date,
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/getConsultations",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const list = await ctx.runQuery(api.consultations.list);
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/updateConsultationStatus",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const { id, status } = await request.json();
    await ctx.runMutation(api.consultations.updateStatus, { id, status });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/deleteConsultation",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const { id } = await request.json();
    await ctx.runMutation(api.consultations.remove, { id });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/clearAllConsultations",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    await ctx.runMutation(api.consultations.clearAll);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

// 2. Inquiries
http.route({
  path: "/submitInquiry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { userName, userPhone, message, date } = await request.json();
    await ctx.runMutation(api.inquiries.create, {
      userName,
      userPhone,
      message,
      status: "대기중",
      date,
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/getInquiries",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const list = await ctx.runQuery(api.inquiries.list);
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/updateInquiryStatus",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const { id, status } = await request.json();
    await ctx.runMutation(api.inquiries.updateStatus, { id, status });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/deleteInquiry",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const { id } = await request.json();
    await ctx.runMutation(api.inquiries.remove, { id });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/clearAllInquiries",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    await ctx.runMutation(api.inquiries.clearAll);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }),
});

// CORS Preflight Options
http.route({ path: "/submitConsultation", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/getConsultations", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/updateConsultationStatus", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/deleteConsultation", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/clearAllConsultations", method: "OPTIONS", handler: handleOptions });

http.route({ path: "/submitInquiry", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/getInquiries", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/updateInquiryStatus", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/deleteInquiry", method: "OPTIONS", handler: handleOptions });
http.route({ path: "/clearAllInquiries", method: "OPTIONS", handler: handleOptions });

export default http;
