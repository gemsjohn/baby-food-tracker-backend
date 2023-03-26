require('dotenv').config()
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");

let apiKey = process.env.OPENAI_API_KEY;


async function handleIncomingMessage(input) {
    console.log("# - STEP 2 A")
    const response = await generateInitialSceenDescription(input);
    const foodGroup = await generateFoodGroup(input);
    return {nutrition: response, foodGroup: foodGroup};
}

async function handleIncomingMessage_FoodGroup(input) {
    console.log("# - STEP 2 A")
    const foodGroup = await generateFoodGroup(input);
    return {foodGroup: foodGroup};
}


async function generateInitialSceenDescription(input) {
    console.log("# - STEP 3 A")
    console.log(input)
    let updatededInput = input.search;

    if (typeof updatededInput == 'string') {
        console.log("Typeof = string")
        updatededInput = input.search;
    } else if (typeof updatededInput == 'object') {
        console.log("Typeof = object")
        updatededInput = input.search.description;
    }

    console.log(updatededInput)

    try {
        let data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": `You are a nutrition expert who specializes in nutrition for children under the age of 2 years old.` },
                { "role": "user", "content": `Can you provide the approximate nutritional values for 100 grams of ${updatededInput}? I'm interested in knowing the amounts of Calories, Protein, Fat, Carbohydrates, Fiber, Sugar, Iron, Zinc, Omega-3 Fatty Acids, and Vitamin D in grams.` },
            ],
            max_tokens: 100
        });

        let config = {
            method: 'post',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: data
        };
        let completion = await axios(config)
            .then(function (response) {
                let output = response.data.choices[0].message;
                console.log("# - STEP 4 A")
                console.log(output)

                function extractNutrients(text) {
                    const nutrientRegex = /(\bCalories\b|\bFat\b|\bSaturated Fat\b|\bCholesterol\b|\bSodium\b|\bPotassium\b|\bProtein\b|\bCarbohydrates\b|\bDietary Fiber\b|\bFiber\b|\bSugar\b|\bVitamin|\bVitamin A|\bVitamin B|\bVitamin C|\bVitamin D|\bZinc|\bIron|\bOmega [A-Z]+\b)\s*:?\s*([\d\.]+)\s*(g|mg|%|IU)?/g;
                    const matches = text.matchAll(nutrientRegex);
                    const nutrients = {};
                    
                    for (const match of matches) {
                      const name = match[1].toLowerCase().replace(/\s+/g, '_');
                      const amount = parseFloat(match[2]);
                      const unit = match[3] ? match[3] : '';
                      
                      nutrients[name] = { amount, unit };
                    }
                    // console.log(nutrients)
                    return nutrients;
                }

                let nutritionFacts = extractNutrients(output.content);
                
                return nutritionFacts;
            })
            .catch(function (error) {
                console.log(error, 'error in calling chat completion');
            });

            
        return completion
    } catch (e) {
        console.log(e, ' error in the callChatGTP function')
    }
} 

async function generateFoodGroup(input) {
    console.log("# - ALT 1")
    console.log(input)
    let updatededInput = input.search;

    if (typeof updatededInput == 'string') {
        console.log("Typeof = string")
        updatededInput = input.search;
    } else if (typeof updatededInput == 'object') {
        console.log("Typeof = object")
        updatededInput = input.search.description;
    }

    console.log(updatededInput)

    try {
        let data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": `You are a nutrition expert who specializes in nutrition for children under the age of 2 years old.` },
                { "role": "user", "content": `Which food group is ${updatededInput} apart of, Fruit, Vegetable, Grain, Protein, or Dairy?` },
            ],
            max_tokens: 10
        });

        let config = {
            method: 'post',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: data
        };
        let completion = await axios(config)
            .then(function (response) {
                let output = response.data.choices[0].message;
                // console.log(output)

                const regex = /\b(fruit|vegetable|grain|protein|dairy)\b/i;

                function findFoodGroup(text) {
                    const match = regex.exec(text);
                    if (match) {
                        return { group: match[1] };
                    }
                    return null;
                }

                const foodGroup = findFoodGroup(output.content);

                return foodGroup;
            })
            .catch(function (error) {
                console.log(error, 'error in calling chat completion');
            });

            
        return completion
    } catch (e) {
        console.log(e, ' error in the callChatGTP function')
    }
} 



module.exports = { handleIncomingMessage, handleIncomingMessage_FoodGroup }