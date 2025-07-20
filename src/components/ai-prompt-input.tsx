"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'openai-gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model, best for complex tasks'
  },
  {
    id: 'openai-gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient, good for most tasks'
  },
  {
    id: 'anthropic-claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable Claude model'
  },
  {
    id: 'anthropic-claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed'
  },
  {
    id: 'anthropic-claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest and most cost-effective'
  }
];

interface AIPromptInputProps {
  onSubmit?: (text: string, response: string, model: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  maxLength?: number;
  showWordCount?: boolean;
  showCharCount?: boolean;
  autoFocus?: boolean;
}

export function AIPromptInput({ 
  onSubmit, 
  placeholder = "Enter your prompt here...", 
  title = "AI Chat",
  description = "Ask anything and get an AI response",
  maxLength = 5000,
  showWordCount = true,
  showCharCount = true,
  autoFocus = false
}: AIPromptInputProps) {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
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
    setError("");
    setResponse("");
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.response);
      onSubmit?.(text, data.response, selectedModel);
      setText("");
      
    } catch (error) {
      console.error('AI API Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get response');
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

  const selectedModelInfo = AI_MODELS.find(model => model.id === selectedModel);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-lg">
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
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model-select">AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.provider} • {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModelInfo && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedModelInfo.name} ({selectedModelInfo.provider})
              </p>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <Label htmlFor="prompt-input">Your Prompt</Label>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="prompt-input"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`min-h-[120px] resize-none transition-all duration-200 ${
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
          </div>
          
          {/* Stats and Submit */}
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
                {isSubmitting ? "Generating..." : "Send to AI"}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Response */}
      {response && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              AI Response
              <Badge variant="secondary" className="text-xs">
                {selectedModelInfo?.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {response}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 