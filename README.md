# Resume Transformer

A web application that transforms unprofessional resumes into industry-standard ones for software engineering roles.

## Features

- Upload resumes in various formats (PDF, DOCX, JPG, PNG)
- Automatic extraction of key information
- Transform data into a professional LaTeX-style format
- Preview and download the transformed resume

## Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Tailwind CSS
- **Document Processing**: Mammoth (DOCX), PDF-Parse (PDF), Tesseract.js (Images)
- **PDF Generation**: PDFKit (fallback), LaTeX (primary)

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- LaTeX distribution (optional, for better PDF quality)
  - TeX Live (Linux)
  - MiKTeX (Windows)
  - MacTeX (macOS)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resume-transformer.git
cd resume-transformer
