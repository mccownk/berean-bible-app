
# Berean Bible Reading Plan Application

A comprehensive web application for structured Bible reading with multiple translation support, progress tracking, and responsive design.

## 🚀 Features

- **Multiple Bible Translations**: Support for ESV, NIV, NASB, and other popular translations
- **Structured Reading Plans**: Organized daily reading schedules
- **Progress Tracking**: Track your reading progress with visual indicators
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Theme Support**: Light and dark mode options
- **Modern UI**: Clean, intuitive interface built with Next.js and Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18.0 or higher)
- npm or yarn package manager
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd berean-bible-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   - `ESV_API_KEY`: Your ESV API key from Crossway
   - `NEXT_PUBLIC_APP_URL`: Your application URL

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
berean-bible-app/
├── app/                    # Next.js app directory
│   ├── components/         # Reusable React components
│   ├── lib/               # Utility functions and configurations
│   ├── styles/            # Global styles and Tailwind config
│   └── pages/             # Application pages
├── docs/                  # Documentation
├── public/                # Static assets
└── tests/                 # Test files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 📖 Usage

### Reading Plans
- Select from various reading plans on the homepage
- Track your daily progress
- Navigate between different days and chapters

### Bible Translations
- Switch between supported translations
- Compare verses across different versions
- Bookmark favorite passages

### Progress Tracking
- Visual progress indicators
- Reading history and statistics
- Achievement milestones

## 🚀 Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

## 🧪 Testing

See [docs/testing.md](docs/testing.md) for testing procedures and guidelines.

## 📚 API Documentation

See [docs/api.md](docs/api.md) for API endpoints and usage.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [docs/branching-strategy.md](docs/branching-strategy.md) for detailed workflow guidelines.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ESV API by Crossway for Bible text access
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Current Version**: v1.0.0-phase1 (Phase 1 MVP Complete)
