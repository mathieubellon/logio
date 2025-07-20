"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PromptInputProps {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

export function PromptInput({ 
  onSubmit, 
  placeholder = "Enter your text here...", 
  title = "Text Input",
  description = "Insert whatever text you want below"
}: PromptInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      onSubmit?.(text);
      setText("");
    } catch (error) {
      console.error("Error submitting text:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to submit
          </p>
          <Button 
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 