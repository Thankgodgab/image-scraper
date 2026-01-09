# Pro Image Scraper

A professional web application to scrape high-quality images from any website and save them directly to a selected folder on your device.

## Features

- **Web Scraper**: Extract all images from a given URL.
- **Smart Filters**: Automatically finds absolute URLs and filters duplicates.
- **Folder Selection**: Uses the advanced File System Access API to let you choose exactly where to save images on your computer.
- **Preview Gallery**: View images before downloading.
- **Professional UI**: Dark mode, responsive design, and smooth animations.

## How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build the Client**:
    ```bash
    npm run build
    ```

3.  **Start the Server**:
    ```bash
    npm start
    ```

4.  Open your browser to `http://localhost:3000`.

## How to Host

This application is ready to be hosted on platforms like Render, Railway, or Heroku.

1.  Push this code to a GitHub repository.
2.  Connect your repository to your hosting provider.
3.  The `npm install` and `npm start` commands are configured to build the frontend and start the backend server automatically.
    - **Build Command**: `npm install && npm run build` (or just `npm install` as it includes a postinstall script).
    - **Start Command**: `npm start`.

## browser Support

The "Choose Folder" feature uses the **File System Access API**, which is currently supported in:
- Google Chrome
- Microsoft Edge
- Opera
- Brave

For other browsers, you may check the console for alternative download methods or specific error messages.
