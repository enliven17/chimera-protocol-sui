import { NextRequest, NextResponse } from 'next/server';

// ASI Agent chat endpoint
export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get ASI Agent endpoint from environment
    const asiAgentEndpoint = process.env.ASI_AGENT_ENDPOINT || 'http://localhost:8001';
    
    // Send message to ASI Agent
    const response = await fetch(`${asiAgentEndpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || 'web-chat',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      // If direct chat fails, try structured query
      const structuredResponse = await fetch(`${asiAgentEndpoint}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          parameters: {
            source: 'web-frontend',
            conversationId,
          },
        }),
      });

      if (!structuredResponse.ok) {
        throw new Error(`ASI Agent not responding: ${response.status}`);
      }

      const structuredData = await structuredResponse.json();
      
      // Format structured response for chat
      let chatMessage = structuredData.message || 'Analysis complete.';
      
      if (structuredData.analysis && structuredData.analysis.length > 0) {
        chatMessage += '\n\nHere are my findings:';
        structuredData.analysis.forEach((analysis: any, idx: number) => {
          chatMessage += `\n${idx + 1}. Market ${analysis.market_id}: ${analysis.recommendation} (${(analysis.confidence * 100).toFixed(0)}% confidence)`;
          chatMessage += `\n   ${analysis.reasoning}`;
        });
      }

      return NextResponse.json({
        message: chatMessage,
        analysis: structuredData.analysis,
        type: 'structured_response',
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      message: data.message || data.content || 'Message received.',
      analysis: data.analysis,
      type: data.type || 'chat_response',
    });

  } catch (error) {
    console.error('Error communicating with ASI Agent:', error);
    
    // Return a helpful error message
    return NextResponse.json({
      message: `I'm having trouble connecting to the ASI Agent right now. This could mean:

1. The ASI Agent is not running (start it with: cd agents/asi-agent && python market_analyzer.py)
2. The agent is starting up (please wait a moment and try again)
3. Network connectivity issues

You can also try asking me specific questions like:
• "analyze market 1"
• "what are the current market odds?"
• "show me betting recommendations"

The ASI Agent should be running on http://localhost:8001`,
      error: true,
      type: 'error_response',
    });
  }
}

// Health check endpoint
export async function GET() {
  try {
    const asiAgentEndpoint = process.env.ASI_AGENT_ENDPOINT || 'http://localhost:8001';
    
    const response = await fetch(`${asiAgentEndpoint}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('ASI Agent health check failed');
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'healthy',
      agent: data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}