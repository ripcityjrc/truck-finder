function buildPrompt(cfg) {
  return `Search for ${cfg.year} Toyota Tundra ${cfg.trim} ${cfg.cab} ${cfg.drivetrain} ${cfg.engine} with ${cfg.bed} bed at Toyota dealerships within ${cfg.radius} miles of zip code ${cfg.zip} (Phoenix, Arizona area).

Please search:
1. toyota.com search-inventory for matching Tundra stock
2. These specific Phoenix-area Toyota dealers: Earnhardt Toyota Mesa, AutoNation Toyota Tempe, Camelback Toyota Phoenix, Right Toyota Scottsdale, Berge Toyota Mesa, Bell Road Toyota Phoenix, Avondale Toyota, Larry H Miller Toyota Peoria, Toyota of Surprise
3. AutoTrader.com and Cars.com for matching vehicles in AZ

For each vehicle found, return a JSON object with:
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

    // Parse request body
    const config = await request.json();

    // Build prompt from config
    const prompt = buildPrompt(config);

    // Call Anthropic API
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
        system: "You are a vehicle inventory search assistant. Search the web to find real in-stock Toyota Tundra vehicles at Arizona dealerships. Return ONLY a valid JSON array — no markdown, no preamble, just raw JSON starting with [ and ending with ].",
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }]
      })
    });

    // Handle Anthropic API errors
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

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
