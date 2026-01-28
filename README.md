# MIMID - Bird Call Learning App

A spaced repetition flashcard application for learning bird calls and vocalizations.

## Features

- **Family & Custom Groups**: Select entire bird families or create custom species groups
- **Dynamic Filtering**: Filter by vocalization type (songs, calls, etc.) and geographic region
- **Spaced Repetition**: Smart review system with mastery tracking
- **Progress Tracking**: Species-based progress with detailed statistics
- **Cross-filtering**: Filter counts update dynamically based on your selections

## API Keys & Secrets

Mimid uses the [eBird API](https://documenter.getpostman.com/view/6643028/S1ENvR6b) and the [Xeno-canto API](https://xeno-canto.org/explore/api) to fetch bird data and vocalizations.

### Local Development
1.  **Browser Storage**: Open "Advanced Settings" in the app and paste your keys. They will be saved to your browser's local storage.
2.  **config.json**: For a more permanent local setup, copy `config.json.example` to `config.json` and add your keys. This file is gitignored.

### GitHub Pages Deployment
If you are deploying this app via GitHub Pages, you can inject your API keys using GitHub Secrets:
1.  Go to your repository **Settings** > **Secrets and variables** > **Actions**.
2.  Add two new repository secrets:
    -   `XC_API_KEY`: Your Xeno-canto API key.
    -   `EBIRD_API_KEY`: Your eBird API key.
3.  The next deployment will automatically bake these into a `config.json` file served with the app.

### Secure Proxy (Secrecy)
For maximum security, where you want to completely hide your API keys from users of the deployed site:
1.  **Deploy the Worker**: Use the provided `proxy/worker.js` to create a Cloudflare Worker (or similar).
2.  **Set Environment Variables**: In your Worker settings, add `XC_API_KEY` and `EBIRD_API_KEY`.
3.  **Connect Mimid**:
    -   **Via UI**: Open "Advanced Settings" and paste your Worker's URL into the "Secure Proxy URL" field.
    -   **Via config.json**: Add `"proxy-url": "https://your-worker.name.workers.dev"` to your `config.json`.
4.  **How it works**: When a proxy is configured, Mimid sends requests to your Worker instead of the APIs directly. The Worker securely injects the keys and returns the data, ensuring the user never sees them in their Network tab.

## Setup

### Backend (Python)

1. Install dependencies:
```bash
pip install flask flask-cors requests
```

2. Run the server:
```bash
python server.py
```

The backend runs on `http://localhost:5000`

### Frontend

1. Install a static server (if you don't have one):
```bash
npm install -g serve
```

2. Run the frontend:
```bash
npx serve . -l 3000
```

The frontend runs on `http://localhost:3000`

## Usage

1. **Select Species**:
   - Choose families from the dropdown (e.g., "Thrushes (Turdidae)")
   - Or add individual species via the search box

2. **Apply Filters** (optional):
   - Select vocalization types (Song, Call, etc.)
   - Select geographic regions

3. **Start Session**:
   - Click "Start Session" to begin
   - Listen to recordings and rate your knowledge:
     - **Incorrect**: Review in 30 seconds
     - **Correct (Hard)**: Review in 1 minute
     - **Correct (Easy)**: Review in 10 minutes
   - Master cards by getting 3 consecutive "Easy" ratings

4. **Track Progress**:
   - View overall progress and species-specific breakdowns
   - See how many cards are mastered, due, or new

## Data Source

Bird call data is sourced from [Xeno-canto](https://xeno-canto.org/), a community database of bird sounds from around the world.

## License

MIT
