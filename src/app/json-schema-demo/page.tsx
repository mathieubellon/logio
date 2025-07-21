"use client";

import { EnhancedAIPrompt } from "@/components/enhanced-ai-prompt";

export default function JsonSchemaDemoPage() {
  const handleSubmit = (text: string, response: string, model: string, systemPrompt: string, jsonSchema?: string) => {
    console.log('AI Submit:', {
      prompt: text,
      response,
      model,
      systemPrompt,
      jsonSchema
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Chat with JSON Schema Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Define structured JSON responses for your AI interactions. Build custom schemas, 
            specify field types, and get perfectly formatted JSON responses from any AI model.
          </p>
        </div>

        <EnhancedAIPrompt
          onSubmit={handleSubmit}
          title="Structured AI Chat"
          description="Build JSON schemas and get structured responses from AI models"
          placeholder="Ask the AI to analyze data, create reports, or provide structured information..."
          maxLength={8000}
          showWordCount={true}
          showCharCount={true}
          autoFocus={true}
        />




      </div>
    </div>
  );
} 