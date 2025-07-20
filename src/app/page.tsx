"use client";

import { EnhancedPromptInput } from "@/components/enhanced-prompt-input";

export default function Home() {
  const handleTextSubmit = (text: string) => {
    // Handle the submitted text here
    console.log("Submitted text:", text);
    // You can add your logic here to process the text
    // For example, send it to an API, save to database, etc.
    
    // For now, let's show an alert to demonstrate the functionality
    alert(`Text submitted successfully!\n\nContent: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Logio</h1>
          <p className="text-xl text-muted-foreground">
            Enter your thoughts, ideas, or any text you want to capture
          </p>
        </div>
        
        <EnhancedPromptInput 
          onSubmit={handleTextSubmit}
          title="What's on your mind?"
          description="Share your thoughts, ideas, or any text you'd like to record"
          placeholder="Start typing here... Share your thoughts, ideas, or anything you want to capture..."
          maxLength={5000}
          showWordCount={true}
          showCharCount={true}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
