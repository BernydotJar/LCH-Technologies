import MetaGeneratorForm from "@/components/meta-generator-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "AI Meta Description Generator - TechFront",
  description: "Use our AI-powered tool to generate compelling meta descriptions for your web pages, optimized for SEO.",
};

export default function MetaGeneratorPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">AI Meta Description Generator</h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          Craft compelling, SEO-friendly meta descriptions for your web pages with the power of AI.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Generate Your Meta Description</CardTitle>
          <CardDescription>
            Provide keywords and page content to generate an optimized meta description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetaGeneratorForm />
        </CardContent>
      </Card>
    </div>
  );
}
