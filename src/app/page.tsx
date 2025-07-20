"use client";

import { AIPromptInput } from "@/components/ai-prompt-input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code } from "lucide-react";

export default function Home() {
  const handleAISubmit = (prompt: string, response: string, model: string, systemPrompt: string) => {
    // Handle the AI response here
    console.log("AI Interaction:", {
      prompt,
      response,
      model,
      systemPrompt,
      timestamp: new Date().toISOString()
    });
    
    // You can add your logic here to save to database, etc.
    // For now, we'll just log it
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Logio AI</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Chat with AI models - Choose between OpenAI and Anthropic
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/ai-demo">
              <Button variant="outline" className="flex items-center gap-2">
                <span>View AI Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/json-schema-demo">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Code className="h-4 w-4" />
                <span>JSON Schema Builder</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <AIPromptInput 
          onSubmit={handleAISubmit}
          title="AI Chat Interface"
          description="Select an AI model and ask anything. Get intelligent responses powered by the latest AI models."
          placeholder="Ask me anything... Write a story, explain a concept, help with coding, or just chat!"
          maxLength={5000}
          showWordCount={true}
          showCharCount={true}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
