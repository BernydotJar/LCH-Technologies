// @ts-nocheck
// TODO: Fix this to satisfy TS checks
"use server";

import { MetaGeneratorSchema, type MetaGeneratorValues } from "@/lib/schemas";
import { generateMetaDescription } from "@/ai/flows/generate-meta-description"; // Ensure this path is correct

interface ActionResult {
  success: boolean;
  metaDescription?: string | null;
  error?: string | null;
}

export async function generateMetaDescriptionAction(
  values: MetaGeneratorValues
): Promise<ActionResult> {
  const validatedFields = MetaGeneratorSchema.safeParse(values);

  if (!validatedFields.success) {
    return { 
        success: false, 
        error: validatedFields.error.flatten().fieldErrors ? 
          Object.values(validatedFields.error.flatten().fieldErrors).join(', ') : 
          "Invalid input data."
      };
  }

  const { keywords, content } = validatedFields.data;

  try {
    const result = await generateMetaDescription({ keywords, content });
    if (result && result.metaDescription) {
      return { success: true, metaDescription: result.metaDescription };
    } else {
      return { success: false, error: "AI failed to generate a meta description." };
    }
  } catch (error) {
    console.error("Error in generateMetaDescriptionAction:", error);
    return { success: false, error: "An error occurred while generating the meta description." };
  }
}
