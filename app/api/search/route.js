function buildPrompt(cfg) {
  return `Generate 2-3 sample Toyota Tundra ${cfg.year} ${cfg.trim} ${cfg.cab} listings from Phoenix, AZ area dealerships.

Return a JSON array with sample vehicles matching these specs:
- Year: ${cfg.year}
- Trim: ${cfg.trim}
- Cab: ${cfg.cab}
- Drivetrain: ${cfg.drivetrain}

Use these Phoenix dealerships: Earnhardt Toyota Mesa, AutoNation Toyota Tempe, Camelback Toyota Phoenix.

Each vehicle JSON object must have:
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
        max_tokens: 1000,
        system: "You are a demo vehicle data generator. Generate realistic sample vehicle listings. Return ONLY a valid JSON array — no markdown, no preamble, just raw JSON starting with [ and ending with ].",
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
