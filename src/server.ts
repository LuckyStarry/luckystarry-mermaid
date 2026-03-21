import express, { Request, Response } from 'express'
import puppeteer from 'puppeteer-core'

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

    const theme = options.theme || 'default'
    const backgroundColor = options.backgroundColor || 'transparent'
    
    // Render using mermaid CLI via puppeteer
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
 * Render Mermaid code to SVG using puppeteer and mermaid
 */
async function renderWithMermaid(code: string, options: { theme: string; backgroundColor: string }): Promise<string> {
  const theme = options.theme || 'default'
  const backgroundColor = options.backgroundColor || 'transparent'

  // Create HTML with mermaid
  const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: '${theme}',
      securityLevel: 'loose'
    });
  </script>
</head>
<body style="background-color: ${backgroundColor}; margin: 0; padding: 20px;">
  <div class="mermaid">${code}</div>
  <script>
    (async () => {
      await mermaid.run();
      window.renderComplete = true;
    })();
  </script>
</body>
</html>
  `

  // Launch puppeteer with chromium
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Wait for mermaid to render
    await page.waitForFunction(() => (window as any).renderComplete, { timeout: 5000 })
    
    // Get the SVG
    const svg = await page.$eval('.mermaid svg', (el: any) => el.outerHTML)
    
    return svg
  } finally {
    await browser.close()
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🎨 Mermaid Render Service running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Render: POST http://localhost:${PORT}/render`)
  console.log(`   Batch:  POST http://localhost:${PORT}/render/batch`)
})

export default app
