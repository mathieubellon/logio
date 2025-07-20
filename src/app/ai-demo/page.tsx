"use client";

import { AIPromptInput } from "@/components/ai-prompt-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIDemoPage() {
  const handleAISubmit = (prompt: string, response: string, model: string, systemPrompt: string) => {
    console.log("AI Demo Interaction:", {
      prompt,
      response,
      model,
      systemPrompt,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">AI Chat Demo</h1>
          <p className="text-xl text-muted-foreground">
            Experience the power of AI with multiple models and custom system prompts
          </p>
        </div>

        {/* AI Chat Component */}
        <AIPromptInput 
          onSubmit={handleAISubmit}
          title="AI Chat Interface"
          description="Select an AI model and start chatting. Try different models and system prompts to see how they respond!"
          placeholder="Ask me anything... Write a story, explain a concept, help with coding, or just chat!"
          maxLength={5000}
          showWordCount={true}
          showCharCount={true}
          autoFocus={false}
        />

        {/* Feature Overview */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Models</CardTitle>
              <CardDescription>Choose from the latest AI models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p><strong>OpenAI:</strong> GPT-4, GPT-3.5 Turbo</p>
                <p><strong>Anthropic:</strong> Claude 3 Opus, Sonnet, Haiku</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚙️ System Prompts</CardTitle>
              <CardDescription>Customize AI behavior and personality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>• Pre-built templates</p>
                <p>• Custom prompts</p>
                <p>• Role-based responses</p>
                <p>• Consistent behavior</p>
                <p>• Collapsible settings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Usage Tips</CardTitle>
            <CardDescription>Get the most out of your AI chat experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">For Best Results:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Be specific in your prompts</li>
                  <li>• Try different models for different tasks</li>
                  <li>• Use system prompts to set AI personality</li>
                  <li>• Use Cmd+Enter for quick submission</li>
                  <li>• Check character limits for long prompts</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">System Prompt Ideas:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>Creative Writer:</strong> For storytelling and creative content</li>
                  <li>• <strong>Code Assistant:</strong> For programming help</li>
                  <li>• <strong>Academic Tutor:</strong> For learning and explanations</li>
                  <li>• <strong>Business Consultant:</strong> For strategic advice</li>
                  <li>• <strong>Training Assistant:</strong> For nutrition and fitness tracking</li>
                  <li>• <strong>Custom:</strong> Define your own AI personality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 