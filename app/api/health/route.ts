import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    project: 'MARCO AI Assistant',
    apis: {
      groq: !!process.env.GROQ_API_KEY,
      serper: !!process.env.SERPER_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    },
    features: {
      voice_recognition: 'Web Speech API (browser-based)',
      text_to_speech: 'ElevenLabs TTS',
      ai_chat: 'GROQ LLaMA',
      web_search: 'SERPER',
      avatar: '3D holographic with React Three Fiber'
    },
    wake_word: 'Wake up Marco',
    shutdown_phrase: 'Goodbye',
    master: 'Waiz Sama'
  }

  return NextResponse.json(health, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

export async function POST() {
  // Extended health check with API connectivity tests
  const results = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    tests: {
      groq: await testGroqConnection(),
      serper: await testSerperConnection(),
      elevenlabs: await testElevenLabsConnection(),
    }
  }

  const allHealthy = Object.values(results.tests).every(test => test.status === 'ok')
  results.status = allHealthy ? 'healthy' : 'degraded'

  return NextResponse.json(results)
}

async function testGroqConnection(): Promise<{ status: string; message: string }> {
  try {
    if (!process.env.GROQ_API_KEY) {
      return { status: 'error', message: 'GROQ_API_KEY not configured' }
    }

    // Simple test - we don't actually call the API in health check to avoid rate limits
    return { status: 'ok', message: 'GROQ API key configured' }
  } catch (error: any) {
    return { status: 'error', message: error.message }
  }
}

async function testSerperConnection(): Promise<{ status: string; message: string }> {
  try {
    if (!process.env.SERPER_API_KEY) {
      return { status: 'error', message: 'SERPER_API_KEY not configured' }
    }

    return { status: 'ok', message: 'SERPER API key configured' }
  } catch (error: any) {
    return { status: 'error', message: error.message }
  }
}

async function testElevenLabsConnection(): Promise<{ status: string; message: string }> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return { status: 'error', message: 'ELEVENLABS_API_KEY not configured' }
    }

    return { status: 'ok', message: 'ElevenLabs API key configured' }
  } catch (error: any) {
    return { status: 'error', message: error.message }
  }
}