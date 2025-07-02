export default async function handler(req, res) {
  console.log('Running cron job');
  res.status(200).send('Hello from Cron!');
}
