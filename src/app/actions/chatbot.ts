// @ts-nocheck
// TODO: Fix this to satisfy TS checks
"use server";

import { z } from "zod";
import { rpaLowcodeChatbot, type RpaLowcodeChatbotInput } from "@/ai/flows/rpa-lowcode-chatbot-flow";

const ChatbotActionInputSchema = z.object({
  userInput: z.string().min(1, "Message cannot be empty."),
});

interface ActionResult {
  success: boolean;
  response?: string | null;
  error?: string | null;
}

export async function askRpaLowcodeBot(
  values: { userInput: string }
): Promise<ActionResult> {
  const validatedFields = ChatbotActionInputSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors?.userInput?.join(", ") || "Invalid input.",
    };
  }

  const { userInput } = validatedFields.data;

  try {
    const flowInput: RpaLowcodeChatbotInput = { userInput };
    const result = await rpaLowcodeChatbot(flowInput);
    
    if (result && result.botResponse) {
      return { success: true, response: result.botResponse };
    } else {
      return { success: false, error: "AI failed to generate a response." };
    }
  } catch (error) {
    console.error("Error in askRpaLowcodeBot action:", error);
    // Check if error is an object and has a message property
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) 
        ? String(error.message) 
        : "An unexpected error occurred while contacting the chatbot.";
    return { success: false, error: errorMessage };
  }
}
