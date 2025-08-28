import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { q } = body

    if (!process.env.SERPER_API_KEY) {
      return NextResponse.json(
        { error: 'SERPER API key not configured' },
        { status: 500 }
      )
    }

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      )
    }

    // Call SERPER API
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: q,
        num: 5, // Limit to 5 results for voice-friendly summaries
      }),
    })

    if (!response.ok) {
      throw new Error(`SERPER API error: ${response.status}`)
    }

    const data = await response.json()

    // Process and summarize results for voice consumption
    const processedResults = {
      query: q,
      answerBox: data.answerBox || null,
      summary: generateSummary(data),
      sources: (data.organic || []).slice(0, 3).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      })),
      searchTime: new Date().toISOString(),
    }

    return NextResponse.json(processedResults)

  } catch (error: any) {
    console.error('Search API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

function generateSummary(data: any): string {
  // Generate a concise summary suitable for voice output
  let summary = ''

  if (data.answerBox) {
    summary = data.answerBox.answer || data.answerBox.snippet || ''
  } else if (data.organic && data.organic.length > 0) {
    // Take the first result's snippet as summary
    summary = data.organic[0].snippet || 'Search completed but no clear answer found.'
  } else {
    summary = 'No results found for your search query.'
  }

  // Clean up summary for voice (remove excessive formatting)
  summary = summary
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .trim()

  // Limit length for voice consumption
  if (summary.length > 300) {
    summary = summary.substring(0, 297) + '...'
  }

  return summary
}

export async function GET() {
  return NextResponse.json({
    message: 'MARCO Search API is running',
    status: 'healthy',
    provider: 'SERPER'
  })
}