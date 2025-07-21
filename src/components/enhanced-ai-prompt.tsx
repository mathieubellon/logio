"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Settings, ChevronsUpDown, Code, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

interface Analyst {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  jsonSchema: JsonField[];
}

interface JsonField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  description: string;
  required: boolean;
  example?: string;
  children?: JsonField[];
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

const PREDEFINED_ANALYSTS: Analyst[] = [
  {
    id: "nutrition-expert",
    name: "Nutrition & Fitness Expert",
    description: "Specialized in calorie analysis and nutrition tracking",
    systemPrompt: "You are a nutrition and fitness expert. Analyze the user's input and return ONLY a valid JSON object with calorie estimates. The client is a male, 48 years old, 180 cm and sedentary. Instructions: - caloriesIn: Sum of all food calories - caloriesOut: Sum of all activity calories - meals: Each item shows TOTAL calories for the full quantity consumed - activities: Each item shows TOTAL calories burned for the full duration - Use realistic calorie estimates based on typical portions and intensities - All numbers must be integers - Set age/weight/height/activityLevel to null if not mentioned - For activityLevel, use one of: \"sedentary\", \"light\", \"moderate\", \"active\", \"very_active\" - Use empty arrays [] if no food/activities mentioned",
    jsonSchema: [
      {
        id: "1",
        name: "caloriesIn",
        type: "number",
        description: "Sum of all food calories",
        required: true,
        example: "1200"
      },
      {
        id: "2",
        name: "caloriesOut",
        type: "number",
        description: "Sum of all activity calories",
        required: true,
        example: "150"
      },
      {
        id: "3",
        name: "age",
        type: "null",
        description: "Age in years (set to null if not mentioned)",
        required: true,
        example: "null"
      },
      {
        id: "4",
        name: "weight",
        type: "null",
        description: "Weight in kg (set to null if not mentioned)",
        required: true,
        example: "null"
      },
      {
        id: "5",
        name: "height",
        type: "null",
        description: "Height in cm (set to null if not mentioned)",
        required: true,
        example: "null"
      },
      {
        id: "6",
        name: "activityLevel",
        type: "null",
        description: "Activity level: sedentary, light, moderate, active, very_active (set to null if not mentioned)",
        required: true,
        example: "null"
      },
      {
        id: "7",
        name: "meals",
        type: "array",
        description: "Array of meal items with calories",
        required: true,
        children: [
          {
            id: "7-1",
            name: "meal",
            type: "object",
            description: "Individual meal item",
            required: true,
            children: [
              {
                id: "7-1-1",
                name: "name",
                type: "string",
                description: "Food name",
                required: true,
                example: "Grilled Chicken Breast"
              },
              {
                id: "7-1-2",
                name: "calories",
                type: "number",
                description: "Total calories for the full quantity consumed",
                required: true,
                example: "250"
              },
              {
                id: "7-1-3",
                name: "quantity",
                type: "string",
                description: "Quantity description",
                required: true,
                example: "1 serving (150g)"
              }
            ]
          }
        ]
      },
      {
        id: "8",
        name: "activities",
        type: "array",
        description: "Array of activity items with calories burned",
        required: true,
        children: [
          {
            id: "8-1",
            name: "activity",
            type: "object",
            description: "Individual activity item",
            required: true,
            children: [
              {
                id: "8-1-1",
                name: "name",
                type: "string",
                description: "Activity name",
                required: true,
                example: "Walking"
              },
              {
                id: "8-1-2",
                name: "calories",
                type: "number",
                description: "Total calories burned for the full duration",
                required: true,
                example: "75"
              },
              {
                id: "8-1-3",
                name: "duration",
                type: "string",
                description: "Duration description",
                required: true,
                example: "30 minutes"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Specialized in financial analysis, reporting, and accounting tasks",
    systemPrompt: "You are a certified public accountant with expertise in financial analysis, tax preparation, and business accounting. Provide accurate, compliant, and professional financial advice. Always consider regulatory requirements and best practices in your responses.",
    jsonSchema: [
      {
        id: "1",
        name: "financialReport",
        type: "object",
        description: "Comprehensive financial report",
        required: true,
        children: [
          {
            id: "1-1",
            name: "reportHeader",
            type: "object",
            description: "Report header information",
            required: true,
            children: [
              {
                id: "1-1-1",
                name: "companyName",
                type: "string",
                description: "Company name",
                required: true,
                example: "ABC Corporation"
              },
              {
                id: "1-1-2",
                name: "reportDate",
                type: "string",
                description: "Report date",
                required: true,
                example: "2024-01-31"
              },
              {
                id: "1-1-3",
                name: "reportType",
                type: "string",
                description: "Type of financial report",
                required: true,
                example: "Income Statement"
              }
            ]
          },
          {
            id: "1-2",
            name: "financialMetrics",
            type: "object",
            description: "Key financial metrics",
            required: true,
            children: [
              {
                id: "1-2-1",
                name: "revenue",
                type: "number",
                description: "Total revenue",
                required: true,
                example: "1000000"
              },
              {
                id: "1-2-2",
                name: "expenses",
                type: "number",
                description: "Total expenses",
                required: true,
                example: "750000"
              },
              {
                id: "1-2-3",
                name: "netIncome",
                type: "number",
                description: "Net income",
                required: true,
                example: "250000"
              },
              {
                id: "1-2-4",
                name: "profitMargin",
                type: "number",
                description: "Profit margin percentage",
                required: true,
                example: "25.0"
              }
            ]
          },
          {
            id: "1-3",
            name: "analysis",
            type: "object",
            description: "Financial analysis and insights",
            required: true,
            children: [
              {
                id: "1-3-1",
                name: "trends",
                type: "array",
                description: "Key trends identified",
                required: true,
                children: [
                  {
                    id: "1-3-1-1",
                    name: "trend",
                    type: "string",
                    description: "Individual trend description",
                    required: true,
                    example: "Revenue increased by 15% compared to previous period"
                  }
                ]
              },
              {
                id: "1-3-2",
                name: "recommendations",
                type: "array",
                description: "Financial recommendations",
                required: true,
                children: [
                  {
                    id: "1-3-2-1",
                    name: "recommendation",
                    type: "string",
                    description: "Individual recommendation",
                    required: true,
                    example: "Consider implementing cost controls to improve profit margins"
                  }
                ]
              },
              {
                id: "1-3-3",
                name: "risks",
                type: "array",
                description: "Identified financial risks",
                required: true,
                children: [
                  {
                    id: "1-3-3-1",
                    name: "risk",
                    type: "string",
                    description: "Individual risk description",
                    required: true,
                    example: "High dependency on single customer (30% of revenue)"
                  }
                ]
              }
            ]
          },
          {
            id: "1-4",
            name: "compliance",
            type: "object",
            description: "Compliance and regulatory information",
            required: true,
            children: [
              {
                id: "1-4-1",
                name: "regulatoryRequirements",
                type: "array",
                description: "Applicable regulatory requirements",
                required: true,
                children: [
                  {
                    id: "1-4-1-1",
                    name: "requirement",
                    type: "string",
                    description: "Individual regulatory requirement",
                    required: true,
                    example: "GAAP compliance maintained"
                  }
                ]
              },
              {
                id: "1-4-2",
                name: "auditNotes",
                type: "string",
                description: "Audit-related notes",
                required: false,
                example: "All transactions properly documented and supported"
              }
            ]
          }
        ]
      }
    ]
  }
];

const FIELD_TYPES = [
  { value: 'string', label: 'String', description: 'Text value' },
  { value: 'number', label: 'Number', description: 'Numeric value' },
  { value: 'boolean', label: 'Boolean', description: 'True or false' },
  { value: 'array', label: 'Array', description: 'List of values' },
  { value: 'object', label: 'Object', description: 'Key-value pairs' },
  { value: 'null', label: 'Null', description: 'Empty value' },
];

interface EnhancedAIPromptProps {
  onSubmit?: (text: string, response: string, model: string, systemPrompt: string, jsonSchema?: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  maxLength?: number;
  showWordCount?: boolean;
  showCharCount?: boolean;
  autoFocus?: boolean;
}

export function EnhancedAIPrompt({ 
  onSubmit, 
  placeholder = "Enter your prompt here...", 
  title = "AI Chat with JSON Schema",
  description = "Ask anything and get structured AI responses",
  maxLength = 5000,
  showWordCount = true,
  showCharCount = true,
  autoFocus = false
}: EnhancedAIPromptProps) {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant. Provide clear, accurate, and helpful responses.");
  const [jsonFields, setJsonFields] = useState<JsonField[]>([
    {
      id: '1',
      name: 'response',
      type: 'string',
      description: 'The main response from the AI',
      required: true,
      example: 'Hello, how can I help you?'
    }
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isOverLimit = charCount > maxLength;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAnalystSelection = (analystId: string) => {
    const analyst = PREDEFINED_ANALYSTS.find(a => a.id === analystId);
    if (analyst) {
      setSelectedAnalyst(analystId);
      setSystemPrompt(analyst.systemPrompt);
      setJsonFields(analyst.jsonSchema);
    }
  };

  const addJsonField = (parentId?: string) => {
    const newField: JsonField = {
      id: generateId(),
      name: '',
      type: 'string',
      description: '',
      required: false,
      example: ''
    };

    if (parentId) {
      setJsonFields(prev => updateFieldChildren(prev, parentId, newField));
    } else {
      setJsonFields(prev => [...prev, newField]);
    }
  };

  const updateFieldChildren = (fields: JsonField[], parentId: string, newField: JsonField): JsonField[] => {
    return fields.map(field => {
      if (field.id === parentId) {
        return {
          ...field,
          children: [...(field.children || []), newField]
        };
      }
      if (field.children) {
        return {
          ...field,
          children: updateFieldChildren(field.children, parentId, newField)
        };
      }
      return field;
    });
  };

  const updateJsonField = (id: string, updates: Partial<JsonField>) => {
    setJsonFields(prev => updateFieldRecursive(prev, id, updates));
  };

  const updateFieldRecursive = (fields: JsonField[], id: string, updates: Partial<JsonField>): JsonField[] => {
    return fields.map(field => {
      if (field.id === id) {
        return { ...field, ...updates };
      }
      if (field.children) {
        return {
          ...field,
          children: updateFieldRecursive(field.children, id, updates)
        };
      }
      return field;
    });
  };

  const removeJsonField = (id: string) => {
    setJsonFields(prev => removeFieldRecursive(prev, id));
  };

  const removeFieldRecursive = (fields: JsonField[], id: string): JsonField[] => {
    return fields.filter(field => {
      if (field.id === id) {
        return false;
      }
      if (field.children) {
        field.children = removeFieldRecursive(field.children, id);
      }
      return true;
    });
  };

  const generateJsonSchema = (): string => {
    const schema = {
      type: 'object',
      properties: {} as Record<string, unknown>,
      required: [] as string[]
    };

    jsonFields.forEach(field => {
      if (field.required) {
        schema.required.push(field.name);
      }
      schema.properties[field.name] = generateFieldSchema(field);
    });

    return JSON.stringify(schema, null, 2);
  };

  const generateFieldSchema = (field: JsonField): Record<string, unknown> => {
    const baseSchema: Record<string, unknown> = {
      type: field.type,
      description: field.description
    };

    if (field.example) {
      baseSchema.example = field.example;
    }

    switch (field.type) {
      case 'array':
        if (field.children && field.children.length > 0) {
          baseSchema.items = generateFieldSchema(field.children[0]);
        } else {
          baseSchema.items = { type: 'string' };
        }
        break;
      case 'object':
        if (field.children && field.children.length > 0) {
          baseSchema.properties = {};
          baseSchema.required = [];
          field.children.forEach(child => {
            if (child.required) {
              (baseSchema.required as string[]).push(child.name);
            }
            (baseSchema.properties as Record<string, unknown>)[child.name] = generateFieldSchema(child);
          });
        }
        break;
    }

    return baseSchema;
  };

  const generateJsonExample = (): string => {
    const example: Record<string, unknown> = {};
    
    jsonFields.forEach(field => {
      example[field.name] = generateFieldExample(field);
    });

    return JSON.stringify(example, null, 2);
  };

  const generateFieldExample = (field: JsonField): unknown => {
    if (field.example) {
      return field.example;
    }

    switch (field.type) {
      case 'string':
        return 'example string';
      case 'number':
        return 42;
      case 'boolean':
        return true;
      case 'array':
        if (field.children && field.children.length > 0) {
          return [generateFieldExample(field.children[0])];
        }
        return ['item1', 'item2'];
      case 'object':
        if (field.children && field.children.length > 0) {
          const obj: Record<string, unknown> = {};
          field.children.forEach(child => {
            obj[child.name] = generateFieldExample(child);
          });
          return obj;
        }
        return { key: 'value' };
      case 'null':
        return null;
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || isOverLimit) return;
    
    setIsSubmitting(true);
    setError("");
    setResponse("");
    
    try {
      const jsonSchema = generateJsonSchema();
      const hasJsonFields = jsonFields.length > 0 && jsonFields.some(field => field.name.trim() !== '');
      const enhancedSystemPrompt = hasJsonFields 
        ? `${systemPrompt}\n\nCRITICAL: Your response must be ONLY valid JSON with no additional text.\n\nRequired JSON structure:\n${generateJsonExample()}\n\nInstructions:\n- Follow the exact structure shown above\n- All values must match the specified types\n- Use the examples as a guide for expected values`
        : systemPrompt;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          model: selectedModel,
          systemPrompt: enhancedSystemPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.response);
      onSubmit?.(text, data.response, selectedModel, systemPrompt, hasJsonFields ? jsonSchema : undefined);
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
  const hasJsonFields = jsonFields.length > 0 && jsonFields.some(field => field.name.trim() !== '');

  const renderJsonField = (field: JsonField, depth = 0) => (
    <div key={field.id} className="space-y-3 border rounded-lg p-4 bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-medium">Field Name</Label>
            <Input
              value={field.name}
              onChange={(e) => updateJsonField(field.id, { name: e.target.value })}
              placeholder="fieldName"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Type</Label>
            <Select value={field.type} onValueChange={(value: JsonField['type']) => updateJsonField(field.id, { type: value })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Description</Label>
            <Input
              value={field.description}
              onChange={(e) => updateJsonField(field.id, { description: e.target.value })}
              placeholder="Field description"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs font-medium">Example</Label>
              <Input
                value={field.example || ''}
                onChange={(e) => updateJsonField(field.id, { example: e.target.value })}
                placeholder="Example value"
                className="h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeJsonField(field.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`required-${field.id}`}
          checked={field.required}
          onChange={(e) => updateJsonField(field.id, { required: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor={`required-${field.id}`} className="text-xs">Required field</Label>
      </div>

             {(field.type === 'object' || field.type === 'array') && (
         <div className="ml-4 border-l-2 border-border pl-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {field.type === 'object' ? 'Object Properties' : 'Array Items'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addJsonField(field.id)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Field
            </Button>
          </div>
          {field.children?.map(child => renderJsonField(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Main Tabs */}
      <Tabs defaultValue="prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt" className="mt-0">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedAnalyst && (
                    <Badge variant="outline" className="text-xs">
                      {PREDEFINED_ANALYSTS.find(a => a.id === selectedAnalyst)?.name}
                    </Badge>
                  )}
                  {selectedModelInfo && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedModelInfo.name}
                    </Badge>
                  )}
                  {isOverLimit && (
                    <Badge variant="destructive" className="text-xs">
                      Over limit
                    </Badge>
                  )}
                  {hasJsonFields && (
                    <Badge variant="secondary" className="text-xs">
                      JSON Schema Active
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedAnalyst ? 'Analyst Mode' : 'Custom Mode'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
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
                     className="min-w-[120px] h-10 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                   >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Send to AI</span>
                      </div>
                    )}
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
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">AI Assistant Settings</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Choose a specialized analyst or customize the system prompt and JSON schema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Analyst Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Predefined Analysts</Label>
                  <p className="text-xs text-muted-foreground">
                    Select a specialized analyst to automatically configure system prompt and JSON schema
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PREDEFINED_ANALYSTS.map((analyst) => (
                    <div
                      key={analyst.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAnalyst === analyst.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAnalystSelection(analyst.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{analyst.name}</h4>
                          <p className="text-xs text-muted-foreground">{analyst.description}</p>
                        </div>
                        {selectedAnalyst === analyst.id && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Model Selection - Only show when analyst is selected */}
              {selectedAnalyst && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-select">Select Model for {PREDEFINED_ANALYSTS.find(a => a.id === selectedAnalyst)?.name}</Label>
                  </div>
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
                </div>
              )}

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="system-prompt-text">System Prompt</Label>
                <Textarea
                  id="system-prompt-text"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define how the AI should behave and respond...

Example:
You are a helpful assistant. Always be polite and provide accurate information.

For nutrition queries, focus on:
- Calorie content
- Nutritional benefits
- Dietary recommendations"
                  className="min-h-[120px] resize-y font-mono text-sm leading-relaxed"
                  disabled={isSubmitting}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    This prompt defines the AI&apos;s role and behavior for all interactions. Use Enter for new lines.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {systemPrompt.length} characters
                  </div>
                </div>
              </div>

              {/* JSON Schema Builder */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>JSON Response Structure</Label>
                  <p className="text-xs text-muted-foreground">
                    Define the structure for structured JSON responses
                  </p>
                </div>
                <div className="space-y-4">
                  {jsonFields.map(field => renderJsonField(field))}
                  
                  <Button
                    variant="outline"
                    onClick={() => addJsonField()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <Label className="text-sm font-medium">JSON Schema</Label>
                    <Textarea
                      value={generateJsonSchema()}
                      readOnly
                      className="min-h-[200px] font-mono text-xs"
                      placeholder="Generated JSON schema will appear here..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Example Response</Label>
                    <Textarea
                      value={generateJsonExample()}
                      readOnly
                      className="min-h-[200px] font-mono text-xs"
                      placeholder="Example JSON response will appear here..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* AI Response */}
      {response && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              AI Response
              <Badge variant="secondary" className="text-xs">
                {selectedModelInfo?.name}
              </Badge>
              {hasJsonFields && (
                <Badge variant="outline" className="text-xs">
                  Structured JSON
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg overflow-x-auto">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 