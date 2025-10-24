import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, markets, conversationHistory } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create context about current markets
    const marketContext = markets && markets.length > 0 
      ? `Current Sui Prediction Markets:
${markets.map((market: any, index: number) => `
${index + 1}. ${market.title}
   - Description: ${market.description}
   - Option A: ${market.optionA} (${market.totalOptionAShares} shares)
   - Option B: ${market.optionB} (${market.totalOptionBShares} shares)
   - Total Pool: ${(market.totalPool / 1e9).toFixed(2)} SUI
   - Status: ${market.resolved ? 'Resolved' : 'Active'}
   - End Time: ${new Date(market.endTime).toLocaleDateString()}
   - Min Bet: ${(market.minBet / 1e9).toFixed(2)} SUI
   - Max Bet: ${(market.maxBet / 1e9).toFixed(2)} SUI
`).join('')}`
      : 'No active markets currently available.';

    // Create conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0
      ? `Previous conversation:
${conversationHistory.map((msg: any) => `${msg.type}: ${msg.content}`).join('\n')}`
      : '';

    const prompt = `You are a professional prediction market analyst specializing in Sui blockchain markets. You provide insightful analysis, betting recommendations, and risk assessments.

${marketContext}

${conversationContext}

User Question: ${message}

Please provide a helpful response. If the user is asking for market analysis or recommendations, structure your response as follows:

1. A conversational response explaining your analysis
2. If applicable, provide specific recommendations in this JSON format at the end:

ANALYSIS_DATA:
{
  "analysis": [
    {
      "marketTitle": "Market Name",
      "recommendation": "BUY_A|BUY_B|HOLD|AVOID",
      "confidence": 75,
      "reasoning": "Brief explanation of your reasoning",
      "riskLevel": "LOW|MEDIUM|HIGH"
    }
  ]
}

Guidelines:
- BUY_A: Recommend betting on Option A
- BUY_B: Recommend betting on Option B  
- HOLD: Wait for better information
- AVOID: Too risky or unclear

- Consider market liquidity, time remaining, option distribution, and external factors
- Confidence should be 0-100 based on available information
- Risk levels: LOW (safe bets), MEDIUM (moderate risk), HIGH (speculative)
- Keep reasoning concise but informative
- Always mention this is not financial advice

Be conversational, helpful, and professional. Focus on education and analysis rather than guaranteeing profits.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to extract analysis data if present
    let analysisData = null;
    const analysisMatch = text.match(/ANALYSIS_DATA:\s*(\{[\s\S]*?\})/);
    
    if (analysisMatch) {
      try {
        analysisData = JSON.parse(analysisMatch[1]);
      } catch (e) {
        console.error('Failed to parse analysis data:', e);
      }
    }

    // Clean response text (remove analysis data section)
    const cleanResponse = text.replace(/ANALYSIS_DATA:[\s\S]*$/, '').trim();

    return NextResponse.json({
      response: cleanResponse,
      analysis: analysisData?.analysis || null,
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate market analysis',
        response: 'I apologize, but I\'m currently unable to analyze the markets. Please try again later.'
      },
      { status: 500 }
    );
  }
}