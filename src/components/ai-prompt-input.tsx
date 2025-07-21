"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Settings, ChevronsUpDown } from "lucide-react";

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

const DEFAULT_SYSTEM_PROMPTS = [
  {
    name: "Default",
    prompt: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses."
  },
  {
    name: "Creative Writer",
    prompt: "You are a creative writer. Write engaging, imaginative, and well-crafted content. Use vivid language and creative storytelling techniques."
  },
  {
    name: "Code Assistant",
    prompt: "You are a programming expert. Write clean, efficient, and well-documented code. Explain your reasoning and suggest best practices."
  },
  {
    name: "Academic Tutor",
    prompt: "You are an academic tutor. Explain complex concepts clearly, provide examples, and help with learning. Be patient and educational."
  },
  {
    name: "Business Consultant",
    prompt: "You are a business consultant. Provide strategic advice, analyze situations, and offer practical business solutions."
  },
  {
    name: "Training Assistant",
    prompt: "You are a nutrition and fitness expert. Analyze the user's input and return ONLY a valid JSON object with calorie estimates.\n\nThe user personal stats are\nmale\n47 years old\n180 cm\nsedentary\n88kg\n\n\nCRITICAL: Your response must be ONLY valid JSON with no additional text.\n\nRequired JSON structure:\n{\n  \"caloriesIn\": 0,\n  \"caloriesOut\": 0,\n  \"age\": null,\n  \"weight\": null,\n  \"height\": null,\n  \"activityLevel\": null,\n\"tdee\":null,\n  \"meals\": [{\"name\": \"Food Name\", \"calories\": 100, \"quantity\": \"1 serving\"}],\n  \"activities\": [{\"name\": \"Activity Name\", \"calories\": 50, \"duration\": \"10 minutes\"}],\n\"balance\":0\n}\n\nInstructions:\n- caloriesIn: Sum of all food calories\n- caloriesOut: Sum of all activity calories\n- meals: Each item shows TOTAL calories for the full quantity consumed\n- activities: Each item shows TOTAL calories burned for the full duration\n- Use realistic calorie estimates based on typical portions and intensities\n- All numbers must be integers\n- Set age/weight/height/activityLevel to null if not mentioned\n- For activityLevel, use one of: \"sedentary\", \"light\", \"moderate\", \"active\", \"very_active\"\n- Use empty arrays [] if no food/activities mentioned\n- Calculate TDEE field based on user personal stats and provide tdee in json response\n- Calculate balance which caloriesIn-(caloriesOut+tdee)"
  },
  {
    name: "Custom",
    prompt: ""
  }
];

interface AIPromptInputProps {
  onSubmit?: (text: string, response: string, model: string, systemPrompt: string) => void;
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
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPTS[0].prompt);
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState("Default");
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isOverLimit = charCount > maxLength;

  const handleSystemPromptChange = (promptName: string) => {
    setSelectedSystemPrompt(promptName);
    const prompt = DEFAULT_SYSTEM_PROMPTS.find(p => p.name === promptName);
    if (prompt) {
      setSystemPrompt(prompt.prompt);
    }
  };

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
          systemPrompt: systemPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.response);
      onSubmit?.(text, data.response, selectedModel, systemPrompt);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-12 px-4 py-3"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{selectedModelInfo?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedModelInfo?.provider} • {selectedModelInfo?.description}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[300px] max-h-[400px] overflow-y-auto">
                {AI_MODELS.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="py-3 px-4 cursor-pointer"
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-sm">{model.name}</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        {model.provider} • {model.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedModelInfo && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedModelInfo.name} ({selectedModelInfo.provider})
              </p>
            )}
          </div>

          {/* System Prompt Settings */}
          <Collapsible open={isSystemPromptOpen} onOpenChange={setIsSystemPromptOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>System Prompt Settings</span>
                </div>
                {isSystemPromptOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="system-prompt-select">System Prompt Template</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-11 px-4 py-2"
                    >
                      <span className="font-medium">{selectedSystemPrompt}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[250px] max-h-[300px] overflow-y-auto">
                    {DEFAULT_SYSTEM_PROMPTS.map((prompt) => (
                      <DropdownMenuItem
                        key={prompt.name}
                        onClick={() => handleSystemPromptChange(prompt.name)}
                        className="py-2.5 px-4 cursor-pointer"
                      >
                        {prompt.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system-prompt-text">Custom System Prompt</Label>
                <Textarea
                  id="system-prompt-text"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define how the AI should behave and respond..."
                  className="min-h-[100px] resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt defines the AI&apos;s role and behavior for all interactions.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
              {systemPrompt && (
                <Badge variant="outline" className="text-xs">
                  Custom System Prompt
                </Badge>
              )}
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