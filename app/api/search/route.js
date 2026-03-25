// Rate limiting: track last search time per IP
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60000; // 1 minute

function buildPrompt(cfg) {
  return `Search for Toyota Tundra ${cfg.year} ${cfg.trim} ${cfg.cab} ${cfg.drivetrain} vehicles currently available at dealerships in the Phoenix, Arizona area.

Find real, current inventory listings and return a JSON array with all matching vehicles you find.

For each vehicle, provide:
- dealerName (string)
- dealerCity (string)
- dealerPhone (string or null)
- stockNumber (string or null)
- exteriorColor (string or null)
- msrp (number, no formatting, or null)
- vin (string or null)
- dealerUrl (string or null)
- status ("In Stock", "In Transit", or "Unknown")
- notes (string — any packages, options, or relevant details)

Return ONLY a valid JSON array starting with [ and ending with ]. No markdown, no explanation. Just the JSON array.`;
}

export async function POST(request) {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'default';
    const now = Date.now();
    const lastSearch = rateLimitMap.get(clientIp);

    if (lastSearch && (now - lastSearch) < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastSearch)) / 1000);
      return Response.json(
        { error: `Rate limit: Please wait ${waitTime} seconds before searching again` },
        { status: 429 }
      );
    }

    // Parse request body
    const config = await request.json();

    // Build prompt from config
    const prompt = buildPrompt(config);

    // Call Anthropic API with web search
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: "You are a helpful vehicle inventory search assistant. Search for real dealership inventory using web search. Return ONLY a valid JSON array — no markdown, no preamble, just raw JSON starting with [ and ending with ].",
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search"
          }
        ],
        messages: [{ role: "user", content: prompt }]
      })
    });

    // Handle Anthropic API errors
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    // Update rate limit tracker
    rateLimitMap.set(clientIp, now);

    // Return response to client
    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Search API error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
