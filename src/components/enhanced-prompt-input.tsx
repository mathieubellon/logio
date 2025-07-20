"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedPromptInputProps {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  maxLength?: number;
  showWordCount?: boolean;
  showCharCount?: boolean;
  autoFocus?: boolean;
}

export function EnhancedPromptInput({ 
  onSubmit, 
  placeholder = "Enter your text here...", 
  title = "Text Input",
  description = "Insert whatever text you want below",
  maxLength = 10000,
  showWordCount = true,
  showCharCount = true,
  autoFocus = false
}: EnhancedPromptInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isOverLimit = charCount > maxLength;

  const handleSubmit = async () => {
    if (!text.trim() || isOverLimit) return;
    
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          {title}
          {isOverLimit && (
            <Badge variant="destructive" className="text-xs">
              Over limit
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`min-h-[150px] resize-none transition-all duration-200 ${
              isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
            disabled={isSubmitting}
          />
          {isOverLimit && (
            <div className="absolute bottom-2 right-2 text-xs text-red-500 font-medium">
              {charCount - maxLength} characters over limit
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {showCharCount && (
              <div className="flex items-center gap-1">
                <span>Characters:</span>
                <span className={`font-mono ${isOverLimit ? 'text-red-500' : ''}`}>
                  {charCount}
                </span>
                {maxLength && (
                  <>
                    <span>/</span>
                    <span className="font-mono">{maxLength}</span>
                  </>
                )}
              </div>
            )}
            {showWordCount && (
              <div className="flex items-center gap-1">
                <span>Words:</span>
                <span className="font-mono">{wordCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Cmd+Enter to submit
            </p>
            <Button 
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting || isOverLimit}
              className="min-w-[100px]"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 