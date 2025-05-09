import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must be less than 500 characters." }),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

export const MetaGeneratorSchema = z.object({
  keywords: z.string().min(3, { message: "Keywords must be at least 3 characters."}),
  content: z.string().min(20, { message: "Content must be at least 20 characters."}),
});

export type MetaGeneratorValues = z.infer<typeof MetaGeneratorSchema>;
