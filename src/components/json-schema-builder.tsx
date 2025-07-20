"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus, Trash2, Settings, Code } from "lucide-react";

interface JsonField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  description: string;
  required: boolean;
  example?: string;
  children?: JsonField[]; // For object and array types
}

interface JsonSchema {
  type: string;
  properties: Record<string, JsonSchemaField>;
  required: string[];
}

interface JsonSchemaField {
  type: string;
  description: string;
  example?: string;
  items?: JsonSchemaField;
  properties?: Record<string, JsonSchemaField>;
  required?: string[];
}

interface JsonSchemaBuilderProps {
  onSchemaChange: (schema: JsonField[]) => void;
  onJsonPreviewChange: (json: string) => void;
}

const FIELD_TYPES = [
  { value: 'string', label: 'String', description: 'Text value' },
  { value: 'number', label: 'Number', description: 'Numeric value' },
  { value: 'boolean', label: 'Boolean', description: 'True or false' },
  { value: 'array', label: 'Array', description: 'List of values' },
  { value: 'object', label: 'Object', description: 'Key-value pairs' },
  { value: 'null', label: 'Null', description: 'Empty value' },
];

export function JsonSchemaBuilder({ onSchemaChange, onJsonPreviewChange }: JsonSchemaBuilderProps) {
  const [fields, setFields] = useState<JsonField[]>([
    {
      id: '1',
      name: 'response',
      type: 'string',
      description: 'The main response from the AI',
      required: true,
      example: 'Hello, how can I help you?'
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addField = (parentId?: string) => {
    const newField: JsonField = {
      id: generateId(),
      name: '',
      type: 'string',
      description: '',
      required: false,
      example: ''
    };

    if (parentId) {
      setFields(prev => updateFieldChildren(prev, parentId, newField));
    } else {
      setFields(prev => [...prev, newField]);
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

  const updateField = (id: string, updates: Partial<JsonField>) => {
    setFields(prev => updateFieldRecursive(prev, id, updates));
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

  const removeField = (id: string) => {
    setFields(prev => removeFieldRecursive(prev, id));
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

  const generateJsonSchema = (): JsonSchema => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {},
      required: []
    };

    fields.forEach(field => {
      if (field.required) {
        schema.required.push(field.name);
      }
      schema.properties[field.name] = generateFieldSchema(field);
    });

    return schema;
  };

  const generateFieldSchema = (field: JsonField): JsonSchemaField => {
    const baseSchema: JsonSchemaField = {
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
              baseSchema.required.push(child.name);
            }
            baseSchema.properties[child.name] = generateFieldSchema(child);
          });
        }
        break;
    }

    return baseSchema;
  };

  const generateJsonExample = (): Record<string, unknown> => {
    const example: Record<string, unknown> = {};
    
    fields.forEach(field => {
      example[field.name] = generateFieldExample(field);
    });

    return example;
  };

  const generateFieldExample = (field: JsonField): any => {
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
          const obj: any = {};
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

  const renderField = (field: JsonField, depth = 0) => (
    <div key={field.id} className="space-y-3 border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-medium">Field Name</Label>
            <Input
              value={field.name}
              onChange={(e) => updateField(field.id, { name: e.target.value })}
              placeholder="fieldName"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Type</Label>
            <Select value={field.type} onValueChange={(value: JsonField['type']) => updateField(field.id, { type: value })}>
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
              onChange={(e) => updateField(field.id, { description: e.target.value })}
              placeholder="Field description"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs font-medium">Example</Label>
              <Input
                value={field.example || ''}
                onChange={(e) => updateField(field.id, { example: e.target.value })}
                placeholder="Example value"
                className="h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeField(field.id)}
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
          onChange={(e) => updateField(field.id, { required: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor={`required-${field.id}`} className="text-xs">Required field</Label>
      </div>

      {(field.type === 'object' || field.type === 'array') && (
        <div className="ml-4 border-l-2 border-gray-300 pl-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {field.type === 'object' ? 'Object Properties' : 'Array Items'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addField(field.id)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Field
            </Button>
          </div>
          {field.children?.map(child => renderField(child, depth + 1))}
        </div>
      )}
    </div>
  );

  // Update parent components when schema changes
  useState(() => {
    onSchemaChange(fields);
    onJsonPreviewChange(JSON.stringify(generateJsonExample(), null, 2));
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          JSON Schema Builder
        </CardTitle>
        <CardDescription>
          Define the structure of your AI response. Build a JSON schema that the AI will follow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>JSON Response Structure</span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-4">
              {fields.map(field => renderField(field))}
              
              <Button
                variant="outline"
                onClick={() => addField()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">JSON Schema</Label>
                <Textarea
                  value={JSON.stringify(generateJsonSchema(), null, 2)}
                  readOnly
                  className="min-h-[200px] font-mono text-xs"
                  placeholder="Generated JSON schema will appear here..."
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Example Response</Label>
                <Textarea
                  value={JSON.stringify(generateJsonExample(), null, 2)}
                  readOnly
                  className="min-h-[200px] font-mono text-xs"
                  placeholder="Example JSON response will appear here..."
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
} 