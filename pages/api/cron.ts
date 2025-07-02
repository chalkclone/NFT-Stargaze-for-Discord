let previousNFTs = new Set();

export default async function handler(req, res) {
  try {
    const wallet = "stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx";
    const webhookUrl = "https://discord.com/api/webhooks/1390047751282098226/GzvjAzSpvDUQKjEg6kDng8WH2WNXVuj-8ovkCXuEsMI-u04eCvhO_GaMkHUKWZ46cWLV";
    const apiUrl = `https://nft-api.mainnet.stargaze-apis.com/api/v1beta/profile/${wallet}/paginated_nfts?limit=100&offset=0`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const nfts = data.nfts || [];

    const newNFTs = nfts.filter(nft => !previousNFTs.has(nft.class_id + nft.token_id));

    for (const nft of newNFTs) {
      const content = {
        content: `🆕 Новый NFT!\n**${nft.name || 'Без названия'}**\n[Открыть NFT](${nft.image || '#'})`,
        embeds: [
          {
            title: nft.name || "NFT",
            image: { url: nft.image },
            url: nft.image,
            footer: { text: `Token: ${nft.token_id}` }
          }
        ]
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      });

      // Запоминаем как "уже отправленный"
      previousNFTs.add(nft.class_id + nft.token_id);
    }

    res.status(200).send(`Checked ${nfts.length} NFTs, sent ${newNFTs.length}`);
  } catch (error) {
    console.error("Cron error:", error);
    res.status(500).send("Something went wrong.");
  }
}
