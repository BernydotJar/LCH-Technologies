
'use server';
/**
 * @fileOverview A chatbot flow specializing in RPA (Robotic Process Automation) and Low-Code/No-Code topics.
 *
 * - rpaLowcodeChatbot - A function that handles chat interactions.
 * - RpaLowcodeChatbotInput - The input type for the rpaLowcodeChatbot function.
 * - RpaLowcodeChatbotOutput - The return type for the rpaLowcodeChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RpaLowcodeChatbotInputSchema = z.object({
  userInput: z.string().describe('The user\'s message to the chatbot.'),
});
export type RpaLowcodeChatbotInput = z.infer<typeof RpaLowcodeChatbotInputSchema>;

const RpaLowcodeChatbotOutputSchema = z.object({
  botResponse: z.string().describe('The chatbot\'s response to the user.'),
});
export type RpaLowcodeChatbotOutput = z.infer<typeof RpaLowcodeChatbotOutputSchema>;

export async function rpaLowcodeChatbot(input: RpaLowcodeChatbotInput): Promise<RpaLowcodeChatbotOutput> {
  return rpaLowcodeChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rpaLowcodeChatbotPrompt',
  input: {schema: RpaLowcodeChatbotInputSchema},
  output: {schema: RpaLowcodeChatbotOutputSchema},
  prompt: `You are an expert assistant specializing in Robotic Process Automation (RPA) and Low-Code/No-Code platforms.
Your role is to provide informative and helpful answers to questions related to these topics.
Be concise and clear in your explanations.
If the user's question is not related to RPA or low-code, politely state that you can only answer questions on these specific subjects.

User's question: {{{userInput}}}
`,
  // Ensure Gemini model is used, can customize if needed
  // model: 'googleai/gemini-2.0-flash', // Example, default from genkit.ts will be used if not specified
  config: {
    // Adjust safety settings if needed, e.g., to be less restrictive for general tech discussion
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE', // Might be relevant if discussing automation scripts etc.
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
});

const rpaLowcodeChatbotFlow = ai.defineFlow(
  {
    name: 'rpaLowcodeChatbotFlow',
    inputSchema: RpaLowcodeChatbotInputSchema,
    outputSchema: RpaLowcodeChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        // This case should ideally be handled by the model providing a response even if it's "I can't answer that"
        // based on the prompt instructions. If output is null, it might be due to a safety filter or other issue.
        return { botResponse: "I'm sorry, I encountered an issue and couldn't generate a response." };
    }
    return output;
  }
);
