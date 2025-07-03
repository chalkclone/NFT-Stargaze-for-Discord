import { NextRequest, NextResponse } from 'next/server';

const WALLET = 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/https://discord.com/api/webhooks/1390326273477447772/Y-EzYSQd5AXzm4YckFW_XGqBY3kL9L9CUld7FNneXXNF6yYZh2TDMAprS62P2xd6dmQU';
const FLOOR_API = 'https://api.mainnet.stargaze-apis.com/api/market/floor/';
const PRICE_API = 'https://api-osmosis.imperator.co/tokens/v2/price/STARS';

let lastMessageId: string | null = null;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const nftRes = await fetch(`https://nft-api.mainnet.stargaze-apis.com/api/v1beta/profile/${WALLET}/paginated_nfts?limit=100`);
    const nftData = await nftRes.json();
    const nfts = nftData.nfts || [];

    const priceRes = await fetch(PRICE_API);
    const { price: starsToUsdc } = await priceRes.json();

    const embeds = await Promise.all(nfts.map(async (nft: any) => {
      const collection = nft.collection || {};
      const tokenId = nft.tokenId || nft.token_id || '???';
      const image = nft.image || nft.media?.image || collection.image;
      const collectionName = collection.name || 'Unknown Collection';
      const collectionId = collection.collection_id;

      let floor = 0;
      try {
        const floorRes = await fetch(FLOOR_API + collectionId);
        const floorData = await floorRes.json();
        floor = parseFloat(floorData?.floorPrice || '0') / 1_000_000;
      } catch {}

      const floorUSDC = floor * starsToUsdc;

      return {
        title: `${collectionName} #${tokenId}`,
        image: { url: image },
        fields: [
          { name: '🪙 Floor (STARS)', value: floor.toFixed(2), inline: true },
          { name: '💵 Floor (USDC)', value: floorUSDC.toFixed(2), inline: true },
        ],
      };
    }));

    // Удалить предыдущее сообщение, если было
    if (lastMessageId) {
      await fetch(`${WEBHOOK_URL}/messages/${lastMessageId}`, {
        method: 'DELETE',
      }).catch(() => {});
    }

    // Отправить новое сообщение
    const webhookRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Stargaze NFT Bot',
        embeds,
      }),
    });

    const webhookJson = await webhookRes.json();
    lastMessageId = webhookJson.id;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка в cron:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
