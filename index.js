const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const websiteUrl = "https://template.creativemox.com/evostart/template-kit/home/"; // Change this to the site you want to scrape

const downloadImage = async (imgUrl, folderPath) => {
    try {
        const response = await axios({
            url: imgUrl,
            method: "GET",
            responseType: "stream",
        });

        const imgName = path.basename(imgUrl.split("?")[0]); // Remove query strings
        const imgPath = path.join(folderPath, imgName);

        response.data.pipe(fs.createWriteStream(imgPath));

        console.log("Downloaded:", imgName);
    } catch (error) {
        console.error("Error downloading", imgUrl, error.message);
    }
};

const scrapeImages = async () => {
    try {
        const { data } = await axios.get(websiteUrl);
        const $ = cheerio.load(data);

        const folderPath = path.join(__dirname, "images");
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

        $("img").each((i, img) => {
            let imgSrc = $(img).attr("src");
            if (!imgSrc) return;

            // Convert relative URLs to absolute URLs
            const absoluteUrl = new URL(imgSrc, websiteUrl).href;

            downloadImage(absoluteUrl, folderPath);
        });

        console.log("\n✔ Scraping finished!");
    } catch (error) {
        console.error("Error:", error.message);
    }
};

scrapeImages();
