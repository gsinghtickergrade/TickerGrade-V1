import { NextResponse } from 'next/server';

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Failed after retries');
}

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    const response = await fetchWithRetry(`${backendUrl}/api/trade-ideas`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Backend error', details: errorText, ideas: [] },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch trade ideas:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend', ideas: [] },
      { status: 500 }
    );
  }
}
