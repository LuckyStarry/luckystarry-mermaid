import express, { Request, Response } from 'express'
import { MermaidConfig } from 'mermaid'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '10mb' }))

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'luckystarry-mermaid', version: '1.0.0' })
})

// Render Mermaid diagram to SVG
app.post('/render', async (req: Request, res: Response) => {
  try {
    const { code, options = {} } = req.body

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "code" parameter',
        message: 'Please provide Mermaid diagram code as a string'
      })
    }

    // Use mermaid CLI via puppeteer for rendering
    const theme = options.theme || 'default'
    const backgroundColor = options.backgroundColor || 'transparent'
    
    // Generate SVG using mermaid
    const svg = await renderWithMermaid(code, { theme, backgroundColor })

    res.json({
      success: true,
      svg,
      metadata: {
        theme,
        backgroundColor,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Mermaid render error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to render Mermaid diagram',
      message: error.message || 'Unknown error occurred'
    })
  }
})

// Batch render endpoint
app.post('/render/batch', async (req: Request, res: Response) => {
  try {
    const { diagrams = [] } = req.body

    if (!Array.isArray(diagrams)) {
      return res.status(400).json({
        error: 'Invalid "diagrams" parameter',
        message: 'Please provide an array of diagram objects'
      })
    }

    const results = await Promise.all(
      diagrams.map(async (diagram: any, index: number) => {
        try {
          const { code, options = {} } = diagram
          
          if (!code || typeof code !== 'string') {
            return {
              index,
              success: false,
              error: 'Invalid diagram code'
            }
          }

          const theme = options.theme || 'default'
          const backgroundColor = options.backgroundColor || 'transparent'
          const svg = await renderWithMermaid(code, { theme, backgroundColor })

          return {
            index,
            success: true,
            svg,
            metadata: { theme, backgroundColor }
          }
        } catch (error: any) {
          return {
            index,
            success: false,
            error: error.message || 'Render failed'
          }
        }
      })
    )

    res.json({
      success: true,
      total: diagrams.length,
      rendered: results.filter((r: any) => r.success).length,
      results
    })
  } catch (error: any) {
    console.error('Batch render error:', error)
    res.status(500).json({
      success: false,
      error: 'Batch render failed',
      message: error.message || 'Unknown error occurred'
    })
  }
})

/**
 * Render Mermaid code to SVG using puppeteer
 */
async function renderWithMermaid(code: string, options: { theme: string; backgroundColor: string }): Promise<string> {
  // For now, return a placeholder SVG
  // In production, this would use puppeteer to render with mermaid
  const theme = options.theme || 'default'
  
  // Simple SVG wrapper for mermaid code
  // This is a placeholder - actual implementation would use puppeteer
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <style>
      .mermaid-text { font-family: Arial, sans-serif; font-size: 14px; }
      .mermaid-box { fill: #f0f0f0; stroke: #333; stroke-width: 2px; }
    </style>
    <rect class="mermaid-box" x="10" y="10" width="380" height="280" rx="5"/>
    <text class="mermaid-text" x="20" y="40">Mermaid Diagram</text>
    <text class="mermaid-text" x="20" y="70">Theme: ${theme}</text>
    <text class="mermaid-text" x="20" y="100">Code preview:</text>
    <text class="mermaid-text" x="20" y="130">${code.substring(0, 50)}...</text>
  </svg>`
}

// Start server
app.listen(PORT, () => {
  console.log(`🎨 Mermaid Render Service running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Render: POST http://localhost:${PORT}/render`)
  console.log(`   Batch:  POST http://localhost:${PORT}/render/batch`)
})

export default app
