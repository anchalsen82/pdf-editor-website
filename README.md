# MediaPro Studio - Ultimate Media Toolkit

An all-in-one platform for professional media processing with a stunning 3D interface.

## Features

- **Photo Enhancement** – Upscale photos to HD or 4K quality
- **Photo Compression** – Compress images with adjustable quality
- **Link Sharing** – Generate shareable links with expiry and password options
- **PDF Editor** – Full-featured PDF editing including text, images, highlights, drawing, page rotation, and deletion
- **Admin Panel** – User management, analytics, feature toggles, and system settings

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- A modern web browser with WebGL support
- Internet connection (for CDN libraries)

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/anchalsen82/pdf-editor-website.git
   cd pdf-editor-website
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Alternative Methods

You can also serve the site with any static file server:

```bash
# Using Python 3
python -m http.server 8000

# Using npx directly
npx serve .
```

## Tech Stack

- **Three.js** – 3D particle background animation
- **pdf-lib** – PDF creation and manipulation
- **PDF.js** – PDF viewing and rendering
- **Supabase** – Backend-as-a-service (configured)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
