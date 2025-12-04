import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'submitted' | 'approved' | 'rejected';
  recipientEmail: string;
  recipientName: string;
  requestDetails: {
    destination: string;
    departureDate: string;
    returnDate: string;
    purpose: string;
    estimatedBudget: number;
    rejectionReason?: string;
    approverName?: string;
  };
}

const getEmailContent = (type: string, details: NotificationRequest['requestDetails'], recipientName: string) => {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  switch (type) {
    case 'submitted':
      return {
        subject: `Travel Request Submitted - ${details.destination}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Travax</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Travel Request Submitted</p>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1f2937;">Hello ${recipientName},</h2>
              <p style="color: #4b5563;">Your travel request has been submitted and is pending approval.</p>
              
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Trip Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Destination:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${details.destination}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Departure:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${formatDate(details.departureDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Return:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${formatDate(details.returnDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Purpose:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${details.purpose}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Budget:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">$${details.estimatedBudget.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #4b5563;">You will be notified once your request has been reviewed.</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">Powered by Travax AI Travel Planning</p>
            </div>
          </div>
        `
      };

    case 'approved':
      return {
        subject: `✅ Travel Request Approved - ${details.destination}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Travax</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Travel Request Approved! 🎉</p>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1f2937;">Great news, ${recipientName}!</h2>
              <p style="color: #4b5563;">Your travel request to <strong>${details.destination}</strong> has been approved${details.approverName ? ` by ${details.approverName}` : ''}.</p>
              
              <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin-top: 0;">Approved Trip</h3>
                <p style="margin: 5px 0;"><strong>Destination:</strong> ${details.destination}</p>
                <p style="margin: 5px 0;"><strong>Dates:</strong> ${formatDate(details.departureDate)} - ${formatDate(details.returnDate)}</p>
                <p style="margin: 5px 0;"><strong>Budget:</strong> $${details.estimatedBudget.toLocaleString()}</p>
              </div>
              
              <p style="color: #4b5563;">You can now proceed with booking your flights and accommodations through Travax.</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">Powered by Travax AI Travel Planning</p>
            </div>
          </div>
        `
      };

    case 'rejected':
      return {
        subject: `Travel Request Update - ${details.destination}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Travax</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Travel Request Update</p>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1f2937;">Hello ${recipientName},</h2>
              <p style="color: #4b5563;">Unfortunately, your travel request to <strong>${details.destination}</strong> was not approved at this time.</p>
              
              <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #991b1b; margin-top: 0;">Request Details</h3>
                <p style="margin: 5px 0;"><strong>Destination:</strong> ${details.destination}</p>
                <p style="margin: 5px 0;"><strong>Dates:</strong> ${formatDate(details.departureDate)} - ${formatDate(details.returnDate)}</p>
                ${details.rejectionReason ? `<p style="margin: 15px 0 5px;"><strong>Reason:</strong></p><p style="margin: 0; color: #991b1b;">${details.rejectionReason}</p>` : ''}
              </div>
              
              <p style="color: #4b5563;">If you have questions about this decision, please reach out to your manager or the travel team.</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">Powered by Travax AI Travel Planning</p>
            </div>
          </div>
        `
      };

    default:
      return { subject: 'Travax Notification', html: '<p>You have a new notification from Travax.</p>' };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Travel notifications function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, requestDetails }: NotificationRequest = await req.json();
    
    console.log(`Sending ${type} notification to ${recipientEmail}`);

    const { subject, html } = getEmailContent(type, requestDetails, recipientName);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Travax <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in travel-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
