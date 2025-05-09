'use server';

/**
 * @fileOverview AI-powered tool to dynamically generate alternative meta descriptions for pages.
 *
 * - generateMetaDescription - A function that generates meta descriptions based on keywords and content.
 * - GenerateMetaDescriptionInput - The input type for the generateMetaDescription function.
 * - GenerateMetaDescriptionOutput - The return type for the generateMetaDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetaDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe('The primary keywords to focus on for the meta description.'),
  content: z
    .string()
    .describe('The content of the page to summarize in the meta description.'),
});
export type GenerateMetaDescriptionInput = z.infer<
  typeof GenerateMetaDescriptionInputSchema
>;

const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z
    .string()
    .describe('The generated meta description for the page.'),
});
export type GenerateMetaDescriptionOutput = z.infer<
  typeof GenerateMetaDescriptionOutputSchema
>;

export async function generateMetaDescription(
  input: GenerateMetaDescriptionInput
): Promise<GenerateMetaDescriptionOutput> {
  return generateMetaDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaDescriptionPrompt',
  input: {schema: GenerateMetaDescriptionInputSchema},
  output: {schema: GenerateMetaDescriptionOutputSchema},
  prompt: `You are an SEO expert tasked with creating compelling meta descriptions.

  Given the following keywords: {{{keywords}}}
  And the following content: {{{content}}}

  Generate a concise and engaging meta description that incorporates the keywords and summarizes the content.
  The meta description should be no more than 160 characters.
  Focus on attracting organic traffic and improving click-through rates from search engine results pages.
  Be creative and persuasive.
  Make sure that the generated meta description is in English.
  `,
});

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
