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

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Use Cases</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Data analysis and reporting</li>
              <li>• API response formatting</li>
              <li>• Structured content generation</li>
              <li>• Database query results</li>
              <li>• Configuration files</li>
              <li>• Survey responses</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Visual JSON schema builder</li>
              <li>• Multiple data types support</li>
              <li>• Nested objects and arrays</li>
              <li>• Field validation and examples</li>
              <li>• Real-time schema preview</li>
              <li>• AI model selection</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Example Schema</h3>
            <div className="bg-gray-50 rounded p-3 text-xs font-mono">
              {`{
  "response": "string",
  "confidence": "number", 
  "tags": ["string"],
  "metadata": {
    "timestamp": "string",
    "source": "string"
  }
}`}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Schema</h3>
              <p className="text-sm text-gray-600">
                Use the visual builder to define your JSON structure with field names, types, and examples.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Write Prompt</h3>
              <p className="text-sm text-gray-600">
                Enter your prompt and the AI will automatically format its response according to your schema.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get JSON</h3>
              <p className="text-sm text-gray-600">
                Receive perfectly structured JSON responses that match your defined schema exactly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 