import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voiceId } = body

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for TTS conversion' },
        { status: 400 }
      )
    }

    // Use provided voice ID or default to a deep, Jarvis-like voice
    const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

    // Call ElevenLabs TTS API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer()

    // Return audio as response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })

  } catch (error: any) {
    console.error('TTS API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Alternative endpoint for getting audio URL (useful for some clients)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')
  
  if (!text) {
    return NextResponse.json(
      { error: 'Text parameter is required' },
      { status: 400 }
    )
  }

  // For GET requests, return a URL that the client can use
  return NextResponse.json({
    message: 'Use POST method for TTS conversion',
    example: {
      method: 'POST',
      body: { text: 'Hello, I am MARCO' },
      response: 'audio/mpeg binary data'
    }
  })
}