// pages/api/stargaze-nfts.js

const WALLET = "stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx";
const WEBHOOK_URL = "https://discord.com/api/webhooks/1390047751282098226/GzvjAzSpvDUQKjEg6kDng8WH2WNXVuj-8ovkCXuEsMI-u04eCvhO_GaMkHUKWZ46cWLV";

export default async function handler(req, res) {
  try {
    // Получаем NFT с кастомного Stargaze API
    const apiURL = `https://nft-api.mainnet.stargaze-apis.com/api/v1beta/profile/${WALLET}/paginated_nfts?limit=50`;
    const nftRes = await fetch(apiURL);
    const { nfts = [] } = await nftRes.json();

    // Получаем старые сообщения от вебхука (для удаления)
    const oldMessagesRes = await fetch(`${WEBHOOK_URL}/messages?limit=50`);
    const oldMessages = await oldMessagesRes.json();

    // Удаляем старые сообщения, отправленные этим же вебхуком
    for (const msg of oldMessages) {
      if (msg.webhook_id) {
        await fetch(`${WEBHOOK_URL}/messages/${msg.id}`, {
          method: "DELETE"
        });
      }
    }

    // Отправляем новые NFT в Discord
    for (const nft of nfts) {
      const metadataUrl = nft.token_data?.token_uri?.replace("ipfs://", "https://ipfs.io/ipfs/");
      const imageUrl = nft.token_data?.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || null;
      const name = nft.token_data?.name || `NFT #${nft.token_id}`;
      const tokenId = nft.token_id || "Unknown";

      const embed = {
        title: `🧬 ${name}`,
        description: `ID: ${tokenId}`,
        image: imageUrl ? { url: imageUrl } : undefined,
        color: 0xff0000,
        footer: {
          text: "Stargaze NFT"
        }
      };

      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
      });
    }

    return res.status(200).json({ success: true, count: nfts.length });
  } catch (error) {
    console.error("Error loading Stargaze NFTs:", error);
    return res.status(500).json({ error: "Failed to fetch or send NFTs" });
  }
}
