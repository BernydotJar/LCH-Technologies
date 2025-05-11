// @ts-nocheck
// TODO: Fix this to satisfy TS checks
"use server";

import { ContactFormSchema, type ContactFormValues } from "@/lib/schemas";

interface ActionResult {
  success: boolean;
  message?: string; // Generic message for success or error
  error?: string | null; // Specific error details if any
}

// --- Bot Protection & Rate Limiting ---
// In-memory store for rate limiting. For production, use a persistent store like Redis.
const submissionAttempts = new Map<string, { count: number; firstAttemptTimestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5; // Max 5 submissions per email per 10 minutes
const MIN_FORM_FILL_TIME_MS = 3000; // Minimum 3 seconds to fill the form

async function sendEmailNotification(data: ContactFormValues) {
  // **IMPORTANT: Email Sending Logic**
  // This is a SKELETON for sending an email.
  // In a real application, you would integrate with an email service provider like:
  // - Resend (https://resend.com)
  // - SendGrid (https://sendgrid.com)
  // - AWS SES (https://aws.amazon.com/ses/)
  // - Nodemailer with an SMTP provider (https://nodemailer.com)
  //
  // Example using a hypothetical email service function:
  //
  // import { sendEmail } from '@/lib/email-service'; // You'd create this
  //
  // try {
  //   await sendEmail({
  //     to: process.env.ADMIN_EMAIL_ADDRESS || "your-admin-email@example.com",
  //     from: "noreply@techfront.com", // Or a verified sender from your email service
  //     subject: `New Contact Form Submission from ${data.name}`,
  //     html: `
  //       <h1>New Contact Submission</h1>
  //       <p><strong>Name:</strong> ${data.name}</p>
  //       <p><strong>Email:</strong> ${data.email}</p>
  //       <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
  //       <p><strong>Message:</strong></p>
  //       <p>${data.message}</p>
  //     `,
  //   });
  //   console.log("Email notification sent successfully.");
  //   return { success: true };
  // } catch (error) {
  //   console.error("Failed to send email notification:", error);
  //   return { success: false, error: "Could not send email notification." };
  // }

  // **SIMULATION ONLY:**
  console.log("SIMULATING Email Notification Sent:");
  console.log("To: admin@techfront.com");
  console.log("Subject: New Contact Form Submission from", data.name);
  console.log("Body Details:", data);
  // Simulate a small delay for email sending
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}


export async function submitContactForm(
  values: ContactFormValues
): Promise<ActionResult> {
  const submissionReceivedTimestamp = Date.now();

  // 1. Honeypot Check (Basic Bot Protection)
  // If the 'honeypot' field (which should be hidden from users) is filled,
  // it's likely a bot.
  if (values.honeypot) {
    console.warn("Honeypot field filled. Potential bot detected.");
    // Return a generic success message to avoid revealing the technique
    return { success: true, message: "Thank you for your submission!" };
  }

  const validatedFields = ContactFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors
        ? Object.values(validatedFields.error.flatten().fieldErrors).join(", ")
        : "Invalid form data.",
      message: "Validation failed. Please check your input."
    };
  }

  const { name, email, company, message, formLoadTimestamp } = validatedFields.data;

  // 2. Timestamp Check (Basic Bot Protection)
  // Check if the form was submitted too quickly after loading.
  if (formLoadTimestamp) {
    const timeToFill = submissionReceivedTimestamp - formLoadTimestamp;
    if (timeToFill < MIN_FORM_FILL_TIME_MS) {
      console.warn(`Form submitted too quickly (${timeToFill}ms). Potential bot for email: ${email}`);
      // Return a generic success message
      return { success: true, message: "Thank you for your submission!" };
    }
  } else {
    // This case might happen if JavaScript is disabled or there's an issue with the hidden field.
    // You might want to log this or handle it as a less trusted submission.
    console.warn("formLoadTimestamp not provided. Skipping quick submission check.");
  }


  // 3. Rate Limiting (Basic Bot/Spam Protection)
  // This uses the user's email as an identifier for rate limiting.
  // For more robust IP-based rate limiting, you'd typically use middleware
  // or an API route context if not directly available in server actions.
  const now = Date.now();
  const userAttempts = submissionAttempts.get(email) || { count: 0, firstAttemptTimestamp: now };

  if (userAttempts.firstAttemptTimestamp < now - RATE_LIMIT_WINDOW_MS) {
    // Reset window if it has passed
    userAttempts.count = 0;
    userAttempts.firstAttemptTimestamp = now;
  }

  userAttempts.count++;
  submissionAttempts.set(email, userAttempts);

  if (userAttempts.count > MAX_SUBMISSIONS_PER_WINDOW) {
    console.warn(`Rate limit exceeded for email: ${email}`);
    return {
      success: false,
      error: "Too many submissions. Please try again later.",
      message: "You've submitted this form too many times recently. Please wait a few minutes and try again."
    };
  }


  // --- Actual Form Processing & Email Sending ---
  console.log("Contact Form Submission Received (Passed Bot Checks):");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Company:", company);
  console.log("Message:", message);

  // Simulate sending email notification
  const emailResult = await sendEmailNotification(validatedFields.data);

  if (emailResult.success) {
    return { success: true, message: "Thank you for contacting us. We'll be in touch soon!" };
  } else {
    return { success: false, error: emailResult.error || "Failed to process your request. Please try again.", message: "Sorry, we couldn't send your message at this time." };
  }
}
