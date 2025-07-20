"use client";

import { AIPromptInput } from "@/components/ai-prompt-input";

export default function Home() {
  const handleAISubmit = (prompt: string, response: string, model: string) => {
    // Handle the AI response here
    console.log("AI Interaction:", {
      prompt,
      response,
      model,
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
          <p className="text-xl text-muted-foreground">
            Chat with AI models - Choose between OpenAI and Anthropic
          </p>
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
