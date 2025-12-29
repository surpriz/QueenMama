import { NextResponse } from 'next/server';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
