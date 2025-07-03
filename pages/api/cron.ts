let lastMessageId: string | null = null;  // здесь будем хранить ID отправленного сообщения

export default async function handler(req, res) {
  try {
    const wallet = "stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx";
    const webhookUrl = "https://discord.com/api/webhooks/1390047...SpvDUQKjEg6kDng8WH2WNXVuj-8ovkCXuEsMI-u04eCvhO_GaMkHUKWZ46cWLV";
    const apiUrl = `https://nft-api.mainnet.stargaze-apis.com/api/v1beta/profile/${wallet}/paginated_nfts?limit=100&offset=0`;

    // Получаем список текущих NFT
    const response = await fetch(apiUrl);
    const data = await response.json();
    const nfts = data.nfts || [];

    // Формируем массив embed-ов для каждого NFT
    const embeds: any[] = nfts.map((nft: any) => ({
      title: nft.name || nft.class_id || "NFT",      // можно вывести название или ID коллекции
      image: { url: nft.image },                     // изображение NFT
      footer: { text: `Token ID: ${nft.token_id}` }, // в футере указываем ID токена
      fields: [
        { name: "Floor (STARS)", value: "N/A", inline: true },  // заменить реальным флором
        { name: "Floor (USDC)",  value: "N/A", inline: true }   // заменить эквивалентом в USDC
      ]
    }));

    // Контент сообщения (можно добавить текст перед списком NFT)
    const content = "📂 Мои NFT:";
    const body = JSON.stringify({ content, embeds });

    if (!lastMessageId) {
      // Первый запуск: отправляем сообщение и сохраняем его ID
      const resWebhook = await fetch(webhookUrl + "?wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      });
      if (!resWebhook.ok) {
        throw new Error(`Webhook POST error: ${resWebhook.status}`);
      }
      const result = await resWebhook.json();
      lastMessageId = result.id;  // сохраняем ID сообщения для последующего обновления
    } else {
      // Последующие запуски: обновляем (PATCH) уже созданное сообщение
      const editUrl = `${webhookUrl}/messages/${lastMessageId}`;
      const resEdit = await fetch(editUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: body
      });
      if (!resEdit.ok) {
        throw new Error(`Webhook PATCH error: ${resEdit.status}`);
      }
    }

    res.status(200).send(`Updated ${nfts.length} NFTs`);
  } catch (error) {
    console.error("Cron error:", error);
    res.status(500).send("Ошибка при обновлении сообщений NFT.");
  }
}
