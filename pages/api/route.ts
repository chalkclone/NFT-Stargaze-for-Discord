import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 🧠 Здесь будет твоя логика обновления NFT и отправки в Discord webhook

    console.log('✅ CRON вызван и авторизован');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка при выполнении cron:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
