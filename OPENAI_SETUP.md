# 🤖 OpenAI Integration Setup Guide for iJAC AI Chatbot

## ✅ Completed Steps

1. **OpenAI SDK Installed** ✅
   - Added `openai` package to dependencies
   - Ready for API integration

2. **API Route Created** ✅ 
   - `/src/app/api/chat/route.ts` handles OpenAI requests
   - Configured with iJAC-specific system prompt
   - Uses `gpt-4o-mini` for cost efficiency
   - Includes comprehensive fallback system

3. **AIChat Component Updated** ✅
   - Real OpenAI integration implemented
   - Professional UI with "Potenciado por OpenAI" branding
   - Context-aware conversations
   - Error handling with fallback responses

4. **Environment File Created** ✅
   - `.env.local` ready for API key

## 🔑 Next Steps - API Key Setup

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the generated key (starts with `sk-`)

### Step 2: Add API Key to Environment

Edit `.env.local` file and replace:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```env
OPENAI_API_KEY=sk-your_actual_key_here
```

### Step 3: Test the Integration

1. Start development server: `npm run dev`
2. Open the website and click the AI chat button
3. Ask questions like:
   - "¿Qué servicios ofrecen?"
   - "¿Cuánto cuesta un sitio web?"
   - "¿Trabajan con React?"

## 🎯 Features Implemented

### 🧠 **AI Intelligence**
- **OpenAI GPT-4o-mini** for natural conversations
- **Context-aware responses** with conversation history
- **iJAC-specific knowledge** about services, pricing, contact info

### 🔄 **Reliability**
- **Fallback system** if OpenAI API fails
- **Error handling** with user-friendly messages
- **Graceful degradation** to rule-based responses

### 💰 **Cost Optimization**
- **gpt-4o-mini model** (20x cheaper than GPT-4)
- **Token limits** (300 max tokens per response)
- **Efficient prompting** for focused responses

### 🎨 **User Experience**
- **Animated UI** with Framer Motion
- **Quick question buttons** for easy interaction
- **Typing indicators** during AI processing
- **Professional branding** with OpenAI attribution

## 📊 Expected Costs

With OpenAI Plus subscription:
- **gpt-4o-mini**: $0.15 per 1M input tokens
- **Average conversation**: ~$0.001-0.005
- **100 conversations/day**: ~$0.10-0.50/day

## 🔧 Customization Options

### 1. Model Selection
```typescript
model: "gpt-4o-mini", // Current (cost-effective)
// model: "gpt-4o",    // More powerful but expensive
```

### 2. Response Length
```typescript
max_tokens: 300, // Current limit
// max_tokens: 500, // Longer responses
```

### 3. AI Personality
Edit the system prompt in `/src/app/api/chat/route.ts` to adjust:
- Response style
- Company knowledge
- Technical details

## 🚀 Deployment Notes

### For Static Export (Hostinger)
The API routes are dynamic and won't work with static export. Options:

1. **Keep current setup** - Use with regular Next.js hosting (Vercel, Netlify)
2. **Client-side only** - Move OpenAI calls to client (less secure)
3. **External API** - Create separate backend service

### Recommended: Deploy to Vercel
```bash
# Deploy to Vercel (supports API routes)
npx vercel
```

## 🔒 Security Best Practices

1. **Never expose API key** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** for production
4. **Monitor API usage** to control costs

## 📞 Support

If you need help with:
- API key setup
- Testing the integration
- Customizing responses
- Deployment options

Just let me know! The AI chatbot is now ready to provide intelligent, context-aware assistance to your customers. 🎉
