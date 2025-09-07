import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

// 🔐 Get secrets safely from environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Check if keys exist (helps debug on Render)
if (!TELEGRAM_TOKEN || !TMDB_API_KEY) {
  console.error("❌ Missing TELEGRAM_TOKEN or TMDB_API_KEY in environment variables.");
  process.exit(1); // stop the app if secrets are missing
}

// Create Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Command: /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎬 Welcome to MovieBot! Send me a movie name and I'll fetch details.");
});

// Handle messages (movie search)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const query = msg.text;

  // Ignore the /start command
  if (query.toLowerCase() === "/start") return;

  try {
    // Call TMDB API
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      const reply = `
🎥 *${movie.title}* (${movie.release_date?.split("-")[0] || "N/A"})
⭐ Rating: ${movie.vote_average}/10
📝 Overview: ${movie.overview || "No description available."}
      `;
      bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ No results found.");
    }
  } catch (error) {
    console.error("Error fetching movie:", error);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Try again later.");
  }
});
