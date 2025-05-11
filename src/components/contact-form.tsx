
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ContactFormSchema, type ContactFormValues } from "@/lib/schemas";
import { submitContactForm } from "@/app/actions/contact";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTimestamp, setFormLoadTimestamp] = useState<number | undefined>(undefined);

  // Set form load timestamp when the component mounts
  useEffect(() => {
    setFormLoadTimestamp(Date.now());
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
      honeypot: "", // Initialize honeypot field
      formLoadTimestamp: undefined,
    },
  });

  // Watch for formLoadTimestamp to be set and update the form value
  // This ensures it's included in the submission data if JS is enabled
  useEffect(() => {
    if (formLoadTimestamp) {
      form.setValue("formLoadTimestamp", formLoadTimestamp, { shouldValidate: false });
    }
  }, [formLoadTimestamp, form]);


  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    
    // Ensure the latest formLoadTimestamp is included, especially if user submits very quickly
    const submissionValues = {
      ...values,
      formLoadTimestamp: form.getValues("formLoadTimestamp") || Date.now() // Fallback if not set earlier
    };

    try {
      const result = await submitContactForm(submissionValues);
      if (result.success) {
        toast({
          title: "Message Sent!",
          description: result.message || "Thank you for contacting us. We'll be in touch soon.",
        });
        form.reset({ name: "", email: "", company: "", message: "", honeypot: "", formLoadTimestamp: Date.now()}); // Reset with new timestamp
        setFormLoadTimestamp(Date.now()); // Reset for next submission
      } else {
        toast({
          title: "Error",
          description: result.message || result.error || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot Field: Visually hidden, for bot detection */}
        <FormField
          control={form.control}
          name="honeypot"
          render={({ field }) => (
            <FormItem className="sr-only-honeypot" aria-hidden="true">
              <FormLabel>Leave this field empty</FormLabel>
              <FormControl>
                <Input {...field} tabIndex={-1} autoComplete="off" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Hidden field for form load timestamp */}
         <input type="hidden" {...form.register("formLoadTimestamp")} />


        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your Company Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us how we can help you..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </Form>
  );
}
