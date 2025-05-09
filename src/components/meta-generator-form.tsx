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
import { MetaGeneratorSchema, type MetaGeneratorValues } from "@/lib/schemas";
import { generateMetaDescriptionAction } from "@/app/actions/meta-generator";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

export default function MetaGeneratorForm() {
  const { toast } = useToast();
  const [generatedMeta, setGeneratedMeta] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<MetaGeneratorValues>({
    resolver: zodResolver(MetaGeneratorSchema),
    defaultValues: {
      keywords: "",
      content: "",
    },
  });

  async function onSubmit(values: MetaGeneratorValues) {
    setIsGenerating(true);
    setGeneratedMeta(null);
    try {
      const result = await generateMetaDescriptionAction(values);
      if (result.success && result.metaDescription) {
        setGeneratedMeta(result.metaDescription);
        toast({
          title: "Meta Description Generated!",
          description: "Review the generated meta description below.",
        });
      } else {
        toast({
          title: "Error Generating Meta Description",
          description: result.error || "Failed to generate meta description. Please try again.",
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
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., innovative technology, AI solutions, business growth" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the main content of your web page here..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Meta Description
              </>
            )}
          </Button>
        </form>
      </Form>

      {generatedMeta && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Generated Meta Description</CardTitle>
            <CardDescription>Copy and use this for your page's SEO settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={generatedMeta} readOnly className="min-h-[100px] bg-secondary" />
            <p className="text-sm text-muted-foreground mt-2">Length: {generatedMeta.length} characters</p>
             <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(generatedMeta);
                  toast({ title: "Copied!", description: "Meta description copied to clipboard." });
                }}
              >
                Copy to Clipboard
              </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
