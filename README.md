# Catan Companion

A web-based companion app for **The Settlers of Catan** that helps you make better strategic decisions with real-time probability calculations, resource analysis, trading insights, and smart recommendations.

## Features

- **Interactive hex board** - Click to place colonies, cities, and mark opponents
- **Real-time statistics** - Resource probabilities updated as you place settlements
- **Smart tips** - Warns about missing resources, weak production, port synergies, and optimal robber placement
- **Trading rates** - See your effective trading rates based on port access
- **Resource scarcity** - Board-wide resource availability overview
- **Robber tracking** - Place the robber to see its impact on your production
- **Game sharing** - Clone and share your board setup via URL
- **Dark mode** - Toggle between light and dark themes
- **Manual or image setup** - Configure the board manually or upload a screenshot (OpenAI Vision)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Nginx |
| Backend | Flask (Python 3.11), Gunicorn |
| Database | MongoDB 7 |
| Deployment | Docker Compose |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Run

```sh
docker compose up --build
```

The app will be available at **http://localhost:3000**.

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | api | OpenAI API key for board image parsing (optional) |
| `MONGO_URI` | api | MongoDB connection string (default: `mongodb://mongo:27017`) |
| `MONGO_DB` | api | Database name (default: `catan`) |
| `REACT_APP_API_URL` | frontend | API base URL (default: empty, uses nginx proxy) |

To enable image parsing, create a `.env` file at the project root:

```sh
OPENAI_API_KEY=sk-your-key-here
```

## Project Structure

```
catan-statistics/
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py                  # Flask app factory
│   ├── config.py               # Environment config
│   ├── models/
│   │   └── game.py             # Game data model
│   ├── routes/
│   │   └── games.py            # API endpoints
│   └── services/
│       ├── game_logic.py       # Board logic & probability calculations
│       ├── openai_client.py    # OpenAI Vision integration
│       └── image_processing.py # Board image parsing
└── frontend/
    ├── Dockerfile
    ├── nginx.conf              # Nginx reverse proxy config
    ├── package.json
    └── src/
        ├── App.js              # Main app with routing & state
        ├── api.js              # API client
        ├── responsive.css      # Theme variables & responsive layout
        ├── components/
        │   ├── HexBoard.js         # Interactive SVG game board
        │   ├── SetupForm.js        # Board configuration wizard
        │   ├── SetupBoardPreview.js # Setup step 2 board preview
        │   ├── StatsPanel.js       # Resource probability tables
        │   ├── TipsCard.js         # Strategic recommendations
        │   ├── TradingCard.js      # Port trading rates
        │   ├── ScarcityCard.js     # Board resource availability
        │   ├── SettlementsCard.js   # Colony/city/points counter
        │   ├── BoardLegend.js      # Interactive board legend
        │   └── CollapsibleCard.js  # Reusable card wrapper
        └── shared/
            ├── boardGeometry.js # Hex grid math & layout
            ├── constants.js     # Resources, ports, colors
            └── ThemeContext.js   # Dark/light theme provider
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/games` | Create a game with manual board setup |
| `POST` | `/api/games/parse` | Create a game from a board screenshot |
| `GET` | `/api/games/:id` | Get full game state |
| `PATCH` | `/api/games/:id/settlements/:position` | Cycle settlement state (available > colony > city > opponent > remove) |
| `PATCH` | `/api/games/:id/robber/:tile_index` | Place or remove the robber |
| `POST` | `/api/games/:id/clone` | Clone a game for sharing |

## How to Play

1. **Setup** - Configure your Catan board by selecting resources and numbers for each tile, then set the ports
2. **Place settlements** - Click on numbered positions on the board to cycle through: available > colony > city > opponent > remove
3. **Read statistics** - The sidebar shows your resource probabilities, tips, trading rates, and more
4. **Track the robber** - Click any tile to place/remove the robber and see its impact
5. **Share** - Click "Share" to create a copy of your board and copy the link

## Development

### Run services individually

```sh
# Start MongoDB
docker compose up -d mongo

# Run the API locally
cd api
pip install -r requirements.txt
MONGO_URI=mongodb://localhost:27017 MONGO_DB=catan flask --app api.app:create_app run --port 5001

# Run the frontend locally
cd frontend
npm install
npm start
```

### Lint

```sh
make lint
```
