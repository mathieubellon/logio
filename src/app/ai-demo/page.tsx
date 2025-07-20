"use client";

import { AIPromptInput } from "@/components/ai-prompt-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIDemoPage() {
  const handleAISubmit = (prompt: string, response: string, model: string) => {
    console.log("AI Demo Interaction:", {
      prompt,
      response,
      model,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">AI Chat Demo</h1>
          <p className="text-xl text-muted-foreground">
            Experience the power of AI with multiple models
          </p>
        </div>

        {/* AI Chat Component */}
        <AIPromptInput 
          onSubmit={handleAISubmit}
          title="AI Chat Interface"
          description="Select an AI model and start chatting. Try different models to see how they respond!"
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
              <CardTitle>⚡ Features</CardTitle>
              <CardDescription>What makes this interface special</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>• Real-time AI responses</p>
                <p>• Model switching</p>
                <p>• Character/word counting</p>
                <p>• Error handling</p>
                <p>• Keyboard shortcuts</p>
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
                  <li>• Use Cmd+Enter for quick submission</li>
                  <li>• Check character limits for long prompts</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Model Recommendations:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>GPT-4:</strong> Complex reasoning, coding</li>
                  <li>• <strong>Claude Opus:</strong> Creative writing, analysis</li>
                  <li>• <strong>GPT-3.5:</strong> General chat, quick responses</li>
                  <li>• <strong>Claude Haiku:</strong> Fast, cost-effective</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 