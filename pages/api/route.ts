import { NextResponse } from 'next/server';

export async function GET() {
  // Здесь вызывается твоя логика обновления NFT
  console.log('🚀 Cron запущен!');

  return NextResponse.json({ ok: true });
}
