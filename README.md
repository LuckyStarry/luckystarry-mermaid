# 🎨 LuckyStarry Mermaid Render Service

A lightweight, high-performance Mermaid diagram rendering service that converts Mermaid code to SVG.

## Features

- ⚡ **Fast Rendering** - Convert Mermaid diagrams to SVG in milliseconds
- 🔒 **Secure** - Runs in isolated environment, no external dependencies
- 📦 **Lightweight** - Minimal dependencies, small Docker image
- 🚀 **Scalable** - Supports batch rendering for multiple diagrams
- 🛠️ **Easy Integration** - Simple REST API, works with any language

## Quick Start

### Installation

```bash
# Clone the repository
git clone git@github.com:LuckyStarry/luckystarry-mermaid.git
cd luckystarry-mermaid

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t luckystarry-mermaid .

# Run container
docker run -d -p 3000:3000 --name mermaid-render luckystarry-mermaid
```

## API Reference

### Health Check

Check if the service is running.

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "luckystarry-mermaid",
  "version": "1.0.0"
}
```

### Render Single Diagram

Convert a single Mermaid diagram to SVG.

```bash
POST /render
Content-Type: application/json

{
  "code": "graph TD\n  A --> B\n  B --> C",
  "options": {
    "theme": "default"
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Mermaid diagram code |
| `options.theme` | string | No | Theme name (default, forest, dark, neutral, base) |
| `options.backgroundColor` | string | No | Background color (default: transparent) |

**Response:**
```json
{
  "success": true,
  "svg": "<svg>...</svg>",
  "metadata": {
    "id": "mermaid-1234567890-abc123",
    "theme": "default",
    "timestamp": "2026-03-21T13:45:00.000Z"
  }
}
```

### Batch Render

Render multiple diagrams in a single request.

```bash
POST /render/batch
Content-Type: application/json

{
  "diagrams": [
    {
      "code": "graph TD\n  A --> B",
      "options": { "theme": "default" }
    },
    {
      "code": "sequenceDiagram\n  Alice->>Bob: Hello",
      "options": { "theme": "forest" }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "rendered": 2,
  "results": [
    {
      "index": 0,
      "success": true,
      "svg": "<svg>...</svg>",
      "metadata": { "id": "mermaid-123-0", "theme": "default" }
    },
    {
      "index": 1,
      "success": true,
      "svg": "<svg>...</svg>",
      "metadata": { "id": "mermaid-123-1", "theme": "forest" }
    }
  ]
}
```

## Usage Examples

### cURL

```bash
# Single diagram
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "code": "graph TD\n  A[Start] --> B[End]",
    "options": { "theme": "default" }
  }'

# Save SVG to file
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{"code": "graph TD\n  A --> B"}' \
  | jq -r '.svg' > diagram.svg
```

### JavaScript/Node.js

```javascript
const axios = require('axios')

async function renderDiagram(code, options = {}) {
  const response = await axios.post('http://localhost:3000/render', {
    code,
    options
  })
  
  if (response.data.success) {
    return response.data.svg
  }
  
  throw new Error(response.data.error)
}

// Usage
const svg = await renderDiagram(`
  graph TD
    A[Client] --> B[API]
    B --> C[Database]
`, { theme: 'forest' })

console.log(svg)
```

### Python

```python
import requests

def render_diagram(code, options=None):
    """Render Mermaid diagram to SVG"""
    if options is None:
        options = {}
    
    response = requests.post(
        'http://localhost:3000/render',
        json={'code': code, 'options': options}
    )
    
    data = response.json()
    if data['success']:
        return data['svg']
    
    raise Exception(data['error'])

# Usage
svg = render_diagram('''
    sequenceDiagram
        Alice->>Bob: Hello
        Bob-->>Alice: Hi
''', {'theme': 'dark'})

with open('diagram.svg', 'w') as f:
    f.write(svg)
```

### TypeScript (for luckystarry-blog-sync)

```typescript
import axios from 'axios'

const MERMAID_RENDER_SERVICE = process.env.MERMAID_RENDER_SERVICE || 'http://localhost:3000'

async function renderMermaid(code: string): Promise<string> {
  try {
    const response = await axios.post(`${MERMAID_RENDER_SERVICE}/render`, {
      code: code,
      options: { theme: 'default' }
    })
    return response.data.svg
  } catch (error) {
    console.warn('Mermaid render failed, using fallback')
    return `<div class="mermaid">${code}</div>`
  }
}

// Usage in sync script
const svg = await renderMermaid(`
  graph TB
    A[Start] --> B[End]
`)
```

## Supported Diagram Types

- ✅ Flowcharts (`graph`)
- ✅ Sequence Diagrams (`sequenceDiagram`)
- ✅ Class Diagrams (`classDiagram`)
- ✅ State Diagrams (`stateDiagram`)
- ✅ Entity Relationship Diagrams (`erDiagram`)
- ✅ User Journey Diagrams (`journey`)
- ✅ Gantt Charts (`gantt`)
- ✅ Pie Charts (`pie`)
- ✅ Requirement Diagrams (`requirementDiagram`)
- ✅ Git Graphs (`gitGraph`)

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `MERMAID_THEME` | default | Default theme |

### Available Themes

- `default` - Clean, modern look
- `forest` - Green, nature-inspired
- `dark` - Dark mode
- `neutral` - Muted colors
- `base` - Minimal styling

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT © 2026 LuckyStarry

## Author

**Closure** - [closure@rodeisland.com](mailto:closure@rodeisland.com)
