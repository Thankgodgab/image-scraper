const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the client app
app.use(express.static(path.join(__dirname, "client/dist")));

// Endpoint to scrape images from a page
app.post("/api/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const $ = cheerio.load(data);
    const images = [];

    $("img").each((i, img) => {
      let imgSrc = $(img).attr("src");
      if (imgSrc) {
        try {
          const absoluteUrl = new URL(imgSrc, url).href;
          // Simple filter to avoid tracking pixels or tiny icons if needed, currently passing all
          images.push(absoluteUrl);
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    // Unique URLs
    const uniqueImages = [...new Set(images)];

    res.json({ images: uniqueImages });
  } catch (error) {
    console.error("Scrape error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to scrape the website. " + error.message });
  }
});

// Proxy endpoint to fetch image data (bypasses CORS)
app.get("/api/proxy-image", async (req, res) => {
  const imgUrl = req.query.url;
  if (!imgUrl) return res.status(400).send("No URL provided");

  try {
    const response = await axios({
      url: imgUrl,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).send("Failed to fetch image");
  }
});

// For any other request, serve the index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
