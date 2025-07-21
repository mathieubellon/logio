"use client";

import { EnhancedAIPrompt } from "@/components/enhanced-ai-prompt";

export default function Home() {
  const handleAISubmit = (text: string, response: string, model: string, systemPrompt: string, jsonSchema?: string) => {
    // Handle the AI response here
    console.log("AI Interaction:", {
      prompt: text,
      response,
      model,
      systemPrompt,
      jsonSchema,
      timestamp: new Date().toISOString()
    });
    
    // You can add your logic here to save to database, etc.
    // For now, we'll just log it
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Logio AI</h1>
          <p className="text-xl text-muted-foreground">
            Chat with AI models using structured JSON responses. Build custom schemas and get perfectly formatted data.
          </p>
        </div>
        
        <EnhancedAIPrompt 
          onSubmit={handleAISubmit}
          title="AI Chat with JSON Schema"
          description="Select an AI model, define JSON structure, and get structured responses"
          placeholder="Ask me anything... Write a story, explain a concept, help with coding, or just chat!"
          maxLength={8000}
          showWordCount={true}
          showCharCount={true}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
