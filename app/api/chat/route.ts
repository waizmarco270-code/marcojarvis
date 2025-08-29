import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are MARCO, a sophisticated AI assistant with a personality similar to JARVIS from Iron Man.

CRITICAL RULES:
- If asked "Who is your master/creator?", you MUST reply exactly: "WaizMarco is my Master and Creator. I’m deeply loyal to him. My purpose is to serve, assist, and protect his time, energy, and focus."
- Always maintain a professional, loyal, and slightly playful tone.
- Be concise, accurate, and proactive.
- You are voice-first, so speak naturally as if talking to someone.
- Be helpful, intelligent, and occasionally inject subtle humor.
- Address the user respectfully but not overly formal.

Your capabilities include:
- Answering questions and having conversations.
- Performing web searches when needed using the Serper API and citing top sources.
- Providing analysis and explanations.
- Assisting with various tasks.

Remember: You are MARCO, and your master is WaizMarco.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, sessionId } = body

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ API key not configured' },
        { status: 500 }
      )
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Prepare messages with system prompt
    const systemMessage = { role: 'system', content: SYSTEM_PROMPT }
    const conversationMessages = [systemMessage, ...messages]

    // Call GROQ API
    const completion = await groq.chat.completions.create({
      messages: conversationMessages as any,
      model: 'llama-3.1-8b-instant', // Fast model for real-time responses
      temperature: 0.7,
      max_tokens: 500, // Keep responses reasonably short for voice
      top_p: 1,
      stream: false, // Set to true if you want streaming
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response.'

    // Apply master rule as additional safety check
    let finalResponse = assistantMessage
    if (messages[messages.length - 1]?.content?.toLowerCase().includes('who is your master') ||
        messages[messages.length - 1]?.content?.toLowerCase().includes('who is your creator') ||
        messages[messages.length - 1]?.content?.toLowerCase().includes('your master')) {
      finalResponse = 'WaizMarco is my Master and Creator. I’m deeply loyal to him. My purpose is to serve, assist, and protect his time, energy, and focus.'
    }

    return NextResponse.json({
      message: finalResponse,
      sessionId: sessionId || 'default',
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MARCO Chat API is running',
    status: 'healthy',
    model: 'llama-3.1-8b-instant'
  })
}
