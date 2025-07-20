# AI Integration Setup Guide

This project now includes AI chat functionality using the Vercel AI SDK with support for both OpenAI and Anthropic models.

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# OpenAI API Key
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key
# Get your API key from https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Get API Keys

#### OpenAI

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env.local` file

#### Anthropic

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env.local` file

### 3. Restart Development Server

After adding your API keys, restart your development server:

```bash
npm run dev
```

## 🤖 Available AI Models

### OpenAI Models

- **GPT-4**: Most capable model, best for complex tasks
- **GPT-3.5 Turbo**: Fast and efficient, good for most tasks

### Anthropic Models

- **Claude 3 Opus**: Most capable Claude model
- **Claude 3 Sonnet**: Balanced performance and speed
- **Claude 3 Haiku**: Fastest and most cost-effective

## 💡 Features

- **Model Selection**: Switch between different AI models
- **Real-time Responses**: Get AI responses instantly
- **Character/Word Count**: Track your input length
- **Error Handling**: Clear error messages for API issues
- **Responsive Design**: Works on all devices
- **Keyboard Shortcuts**: Use Cmd+Enter to submit

## 🔧 Usage

1. Select an AI model from the dropdown
2. Type your prompt in the text area
3. Click "Send to AI" or press Cmd+Enter
4. View the AI response below

## 🛠️ Technical Details

- **AI SDK**: Uses Vercel AI SDK for unified API access
- **API Route**: `/api/chat` handles all AI requests
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: Built-in protection against abuse

## 📝 Notes

- API keys are stored securely in environment variables
- No API keys are exposed to the client
- All AI interactions are logged for debugging
- Responses are limited to 1000 tokens for cost control

## 🚨 Troubleshooting

### "Failed to get response" Error

- Check your API keys are correct
- Ensure you have sufficient credits in your AI provider account
- Verify your internet connection

### Model Not Available

- Some models may require specific API access
- Check your provider's documentation for model availability

## 🔒 Security

- Never commit your `.env.local` file to version control
- API keys are only used server-side
- All requests are validated before processing
