import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TELEGRAM_TOKEN || !TMDB_API_KEY) {
  console.error("🚨 Missing TELEGRAM_TOKEN or TMDB_API_KEY in .env file");
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log("🤖 Bot is running... waiting for messages!");

// Handle movie search
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const query = msg.text.trim();

  console.log(`📩 Received: "${query}" from chat ${chatId}`);

  try {
    // 1. Search movie by name
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      await bot.sendMessage(chatId, `❌ No results found for "${query}"`);
      return;
    }

    const movie = searchData.results[0]; // take first result
    const movieId = movie.id;

    // 2. Get full movie details
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,recommendations`;
    const detailsRes = await fetch(detailsUrl);
    const details = await detailsRes.json();

    // Cast (top 5)
    const cast = details.credits?.cast
      ?.slice(0, 5)
      .map((actor) => actor.name)
      .join(", ") || "Not available";

    // Recommendations (similar movies)
    const recommendations =
      details.recommendations?.results
        ?.slice(0, 3)
        .map((rec) => rec.title)
        .join(", ") || "None";

    // Reply message
    const reply = `🎬 *${details.title}* (${details.release_date?.slice(0, 4) || "N/A"})
⭐ Rating: ${details.vote_average || "N/A"} / 10
📝 Plot: ${details.overview || "No plot available"}
👥 Cast: ${cast}
🍿 Similar Movies: ${recommendations}
📅 Release Date: ${details.release_date || "N/A"}
`;

    await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

    // Poster
    if (details.poster_path) {
      await bot.sendPhoto(chatId, `https://image.tmdb.org/t/p/w500${details.poster_path}`);
    }
  } catch (error) {
    console.error("🚨 Error:", error);
    await bot.sendMessage(chatId, "⚠️ Oops! Something went wrong.");
  }
});
