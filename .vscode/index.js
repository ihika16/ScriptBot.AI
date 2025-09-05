import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

// Replace these with your actual keys or use Replit Secrets (recommended)
const TELEGRAM_TOKEN = "7543663664:AAH1zi7htyURiy_KQNftGNwPV4cGsRikmrM";
const OMDB_API_KEY = "f610c236";

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("🤖 Bot is running...");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const query = encodeURIComponent(msg.text);

  const omdbUrl = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${query}`;

  try {
    const response = await fetch(omdbUrl);
    const data = await response.json();

    if (data.Response === "False") {
      bot.sendMessage(chatId, `❌ Movie not found: "${msg.text}"`);
    } else {
      const reply = `🎬 *${data.Title}* (${data.Year})
⭐ Rating: ${data.imdbRating}
📝 Plot: ${data.Plot}
📷 Poster: ${data.Poster !== "N/A" ? data.Poster : "No poster available"}
`;
      bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "🚨 Oops! Something went wrong.");
  }
});
