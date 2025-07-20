"use client";

import { PromptInput } from "@/components/prompt-input";
import { EnhancedPromptInput } from "@/components/enhanced-prompt-input";

export default function DemoPage() {
  const handleTextSubmit = (text: string, componentName: string) => {
    console.log(`${componentName} submitted:`, text);
    alert(`${componentName} submitted successfully!\n\nContent: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Prompt Components Demo</h1>
          <p className="text-xl text-muted-foreground">
            Compare the basic and enhanced prompt input components
          </p>
        </div>

        <div className="grid gap-12">
          {/* Basic Prompt Component */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Basic Prompt Input</h2>
            <PromptInput 
              onSubmit={(text) => handleTextSubmit(text, "Basic Component")}
              title="Simple Text Input"
              description="A clean, simple text input component"
              placeholder="Type your text here..."
            />
          </div>

          {/* Enhanced Prompt Component */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Enhanced Prompt Input</h2>
            <EnhancedPromptInput 
              onSubmit={(text) => handleTextSubmit(text, "Enhanced Component")}
              title="Advanced Text Input"
              description="Enhanced with character count, word count, and better UX"
              placeholder="Type your text here with enhanced features..."
              maxLength={3000}
              showWordCount={true}
              showCharCount={true}
              autoFocus={false}
            />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Features Comparison</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h4 className="font-medium">Basic Component</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Simple text input</li>
                <li>• Submit button</li>
                <li>• Keyboard shortcuts (Cmd+Enter)</li>
                <li>• Loading states</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Enhanced Component</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Character count with limits</li>
                <li>• Word count</li>
                <li>• Visual feedback for limits</li>
                <li>• Auto-focus option</li>
                <li>• Better responsive design</li>
                <li>• Enhanced styling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 