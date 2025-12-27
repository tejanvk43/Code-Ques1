exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { text } = JSON.parse(event.body);

    if (!text || text.length < 50) {
        return {
            statusCode: 400,
            body: JSON.stringify({ valid: false, reason: "Insufficient text content identified." }),
        };
    }

    try {
        const prompt = `
        You are an expert HR AI Resume Validator. Your task is to classify whether the provided text data belongs to a valid professional Resume/CV or not.
        
        Rules:
        1. A Resume/CV MUST contain: Contact Information (Email/Phone), Education History, and Skills or Experience.
        2. Reject random text, code snippets, essays, generic articles, or unrelated documents.
        3. If it is a Resume, output rigid JSON: { "valid": true, "confidence": 0.95, "reason": "Contains clear education and skills sections." }
        4. If NOT a Resume, output rigid JSON: { "valid": false, "confidence": 0.9, "reason": "Text appears to be a random essay/article." }
        5. Do NOT output markdown. Output ONLY JSON.

        Input Text:
        """${text.substring(0, 3000)}"""
        `;

        const response = await fetch('http://localhost:8080/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3:8b',
                prompt: prompt,
                stream: false,
                format: 'json'
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        // Ollama returns the generated text in `response` field
        const jsonResponse = JSON.parse(data.response);

        return {
            statusCode: 200,
            body: JSON.stringify(jsonResponse),
        };

    } catch (error) {
        console.error("AI Validation Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ valid: false, reason: "AI Service Error", error: error.message }),
        };
    }
};
