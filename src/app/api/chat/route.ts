import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

const models = {
  'openai-gpt-4': openai('gpt-4'),
  'openai-gpt-3.5-turbo': openai('gpt-3.5-turbo'),
  'anthropic-claude-3-opus': anthropic('claude-3-opus-20240229'),
  'anthropic-claude-3-sonnet': anthropic('claude-3-sonnet-20240229'),
  'anthropic-claude-3-haiku': anthropic('claude-3-haiku-20240307'),
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, systemPrompt } = await request.json();

    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Prompt and model are required' },
        { status: 400 }
      );
    }

    const selectedModel = models[model as keyof typeof models];
    
    if (!selectedModel) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Prepare the messages array with system prompt if provided
    const messages = [];
    
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({
        role: 'system' as const,
        content: systemPrompt.trim()
      });
    }
    
    messages.push({
      role: 'user' as const,
      content: prompt
    });

    const result = await generateText({
      model: selectedModel,
      messages,
      maxTokens: 1000,
    });

    return NextResponse.json({
      response: result.text,
      model,
      usage: result.usage,
      systemPrompt: systemPrompt || null,
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 