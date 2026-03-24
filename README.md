# Toyota Tundra Finder

Search for Toyota Tundra inventory at Phoenix, AZ area dealerships using AI-powered web search.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get an Anthropic API key:
   - Visit https://console.anthropic.com/
   - Create an account or sign in
   - Generate an API key

3. Create `.env.local` file in project root:
   ```bash
   ANTHROPIC_API_KEY=your-api-key-here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Usage

1. Configure search filters (year, trim, cab, drivetrain, etc.)
2. Click "Search Inventory"
3. View results from Phoenix-area Toyota dealerships

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Anthropic Claude API with web search

## Security

- API key is stored server-side only (never exposed to browser)
- All Anthropic API calls go through Next.js API route
- `.env.local` is git-ignored for security
