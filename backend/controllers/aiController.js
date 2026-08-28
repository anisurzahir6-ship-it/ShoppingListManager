const generateShoppingList = async (req, res) => {
  try {
    const { mealPlan } = req.body;

    // Check if meal plan was provided
    if (!mealPlan) {
      return res.status(400).json({
        message: "Meal plan is required"
      });
    }

    // Send request to local Ollama AI
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `Generate a practical grocery shopping list from this meal plan:

${mealPlan}

Return ONLY valid JSON in this format:

{
  "items": [
    {
      "name": "item name",
      "quantity": 1,
      "unit": "kg",
      "category": "Vegetables"
    }
  ]
}

Rules:
- Combine duplicate ingredients.
- Use realistic quantities.
- Use common grocery categories.
- Do not include explanations.`,
        stream: false,
        format: "json"
      })
    });

    // Check if Ollama responded successfully
    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama request failed: ${response.status} ${errorText}`
      );
    }

    // Convert Ollama response to JSON
    const data = await response.json();

    // Convert AI response into JavaScript object
    const shoppingList = JSON.parse(data.response);

    // Send result to client
    res.status(200).json({
      message: "Shopping list generated successfully",
      shoppingList
    });

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      message: "Failed to generate shopping list",
      error: error.message
    });
  }
};

module.exports = {
  generateShoppingList
};