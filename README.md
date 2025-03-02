# ✨ Resume Transformer

> Transform your resume into a professional, ATS-friendly format optimized for tech roles.

![Made with React](https://img.shields.io/badge/Made_with-React-61DAFB?style=for-the-badge&logo=react)
![Built with TailwindCSS](https://img.shields.io/badge/Built_with-Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css)

## Overview

Resume Transformer takes your existing resume and elevates it to industry standards. Using AI-powered processing, it creates a clean, professional LaTeX-style format that both recruiters and ATS systems love.

### Key Features

- 📄 Multi-format support (PDF, DOCX, JPG, PNG)
- 🤖 Smart information extraction
- 🎯 ATS-optimized formatting
- 👀 Live preview functionality
- 🌓 Dark mode support
- ⚡ Fast processing

## Tech Stack

### Frontend
- React
- TailwindCSS
- Modern UI Components

### Backend
- Node.js & Express
- Document Processing:
  - Mammoth (DOCX)
  - PDF-Parse
  - Tesseract.js (Image Processing)
- LaTeX Generation

## Getting Started

### Prerequisites

- Node.js (v14+)
- LaTeX distribution (optional, recommended for best output):
  ```
  Linux: TeX Live
  Windows: MiKTeX
  macOS: MacTeX
  ```

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resume-transformer.git
cd resume-transformer
```

2. Install dependencies:
```bash
# Frontend setup
cd web-client
npm install

# Backend setup
cd ../api-server
npm install
```

3. Run the application:
```bash
# Start frontend (localhost:3000)
cd web-client
npm start

# Start backend (localhost:5000)
cd api-server
npm run dev
```

## Usage Tips

- Supported formats: PDF, DOCX, JPG, PNG
- Recommended: Use PDF or DOCX for best results
- Preview your transformed resume before downloading
- Dark mode available for comfortable editing

## Development

The project uses modern JavaScript features and follows current best practices:

- React Hooks for state management
- Tailwind for responsive design
- Component-based architecture
- Full dark mode support
- Modern API integration

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Made with ❤️ by Leonard
