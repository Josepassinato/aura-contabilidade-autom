
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as SendGrid from "https://esm.sh/@sendgrid/mail@7.7.0";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const DEFAULT_FROM_EMAIL = "no-reply@contaflix.com";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify SendGrid API key exists
    if (!SENDGRID_API_KEY) {
      console.error("SendGrid API key not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse request body
    const { to, subject, text, html, from = DEFAULT_FROM_EMAIL } = await req.json();
    
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      return new Response(
        JSON.stringify({ error: "To, subject, and body (text or html) are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Configure SendGrid
    SendGrid.setApiKey(SENDGRID_API_KEY);
    
    // Prepare email message
    const msg = {
      to,
      from,
      subject,
      text: text || "",
      html: html || "",
    };

    console.log(`Sending email to ${to} with subject "${subject}"`);
    
    // Send email
    await SendGrid.send(msg);
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
