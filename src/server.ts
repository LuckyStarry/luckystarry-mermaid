import express, { Request, Response } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const execAsync = promisify(exec)

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
    
    // Render using mmdc
    const svg = await renderWithMmdc(code, { theme, backgroundColor })

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
          const svg = await renderWithMmdc(code, { theme, backgroundColor })

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
 * Render Mermaid code to SVG using mmdc (Mermaid CLI)
 */
async function renderWithMmdc(code: string, options: { theme: string; backgroundColor: string }): Promise<string> {
  const theme = options.theme || 'default'
  const backgroundColor = options.backgroundColor || 'transparent'

  // Create temp directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-'))
  const inputFile = path.join(tempDir, 'input.mmd')
  const outputFile = path.join(tempDir, 'output.svg')
  
  try {
    // Write Mermaid code to temp file
    fs.writeFileSync(inputFile, code)
    
    // Build mmdc command
    const puppeteerConfig = path.join(__dirname, '..', 'puppeteer-config.json')
    const backgroundColorArg = backgroundColor !== 'transparent' ? `-b ${backgroundColor}` : '-b transparent'
    const themeArg = `-t ${theme}`
    
    // Execute mmdc
    const command = `mmdc -i "${inputFile}" -o "${outputFile}" ${backgroundColorArg} ${themeArg} -p "${puppeteerConfig}"`
    await execAsync(command)
    
    // Read SVG
    const svg = fs.readFileSync(outputFile, 'utf-8')
    
    return svg
  } catch (error: any) {
    console.error('mmdc render error:', error)
    throw new Error(`mmdc failed: ${error.message}`)
  } finally {
    // Cleanup temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (e) {
      // Ignore cleanup errors
    }
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
