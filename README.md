# Scheduler

A Next.js based scheduler application for managing and scheduling tasks. Built with modern web technologies and real-time capabilities.

## Features

- Fast and responsive scheduler interface
- Real-time updates using Redis
- Built with Next.js 15 and React 19
- TypeScript for type safety
- Tailwind CSS for styling
- Integration with Vercel KV for data persistence

## Tech Stack

- **Framework:** Next.js 15.0.4
- **Runtime:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Redis (via @vercel/kv and ioredis)
- **UI Components:** Lucide React for icons
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Redis instance (local or cloud)

### Installation

1. Clone the repository
```bash
git clone https://github.com/seansoreilly/scheduler.git
cd scheduler
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your configuration values.

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
scheduler/
├── src/
│   ├── app/            # Next.js 13+ App Router
│   ├── components/     # Reusable components
│   ├── lib/           # Utility functions and helpers
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── ...config files
```

## Development

This project uses Next.js with TypeScript. Follow these best practices:

1. Use TypeScript for all new files
2. Follow the existing component structure
3. Style components using Tailwind CSS
4. Keep components small and focused
5. Use the App Router pattern for routing
6. Utilize Redis for data persistence

## Environment Variables

Required environment variables:

```env
# Add required environment variables here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.