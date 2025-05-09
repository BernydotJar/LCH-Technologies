// @ts-nocheck
// TODO: Fix this to satisfy TS checks
"use server";

import { ContactFormSchema, type ContactFormValues } from "@/lib/schemas";

interface ActionResult {
  success: boolean;
  error?: string | null;
}

export async function submitContactForm(
  values: ContactFormValues
): Promise<ActionResult> {
  const validatedFields = ContactFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { 
      success: false, 
      error: validatedFields.error.flatten().fieldErrors ? 
        Object.values(validatedFields.error.flatten().fieldErrors).join(', ') : 
        "Invalid form data." 
    };
  }

  const { name, email, company, message } = validatedFields.data;

  // Simulate processing (e.g., saving to database, sending email)
  console.log("Contact Form Submission:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Company:", company);
  console.log("Message:", message);

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real application, you would integrate with an email service here.
  // For example, using Resend, Nodemailer, etc.

  // Simulate success/failure
  // const shouldSucceed = Math.random() > 0.1; // 90% success rate
  const shouldSucceed = true; // For now, always succeed

  if (shouldSucceed) {
    return { success: true };
  } else {
    return { success: false, error: "Simulated server error. Please try again." };
  }
}
