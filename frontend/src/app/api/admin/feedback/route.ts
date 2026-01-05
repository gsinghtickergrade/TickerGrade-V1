import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('X-Admin-Password') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    
    const response = await fetch(`${backendUrl}/api/admin/feedback`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Backend error', feedback: [] },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend', feedback: [] },
      { status: 500 }
    );
  }
}
