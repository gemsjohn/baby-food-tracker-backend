require('dotenv').config()
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");

let apiKey = process.env.OPENAI_API_KEY;


async function handleIncomingMessage(input) {
    console.log("# - STEP 2 A")
    const response = await generateInitialSceenDescription(input);
    return response;
  }


// async function generateInitialSceenDescription(input) {
//     console.log("# - STEP 3 A")
//     console.log(input)
//     try {
//         let data = JSON.stringify({
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { "role": "system", "content": `You are a nutrition expert who specializes in nutrition for children under the age of 2 years old.` },
//                 { "role": "user", "content": `Can you provide the nutritional values for ${input.search.description} considering the quantity ${input.quantity} and measurement type ${input.measurement}?` },
//             ],
//             max_tokens: 100
//         });

//         let config = {
//             method: 'post',
//             url: 'https://api.openai.com/v1/chat/completions',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${apiKey}`
//             },
//             data: data
//         };
//         let completion = await axios(config)
//             .then(function (response) {
//                 // console.log(JSON.stringify(response.data));
//                 let output = response.data.choices[0].message;
//                 console.log("# - STEP 4 A")
//                 console.log(output)

//                 function extractNutrients(text) {
//                     const nutrientRegex = /(\bCalories\b|\bFat\b|\bSaturated Fat\b|\bCholesterol\b|\bSodium\b|\bPotassium\b|\bProtein\b|\bCarbohydrates\b|\bDietary Fiber\b|\bFiber\b|\bSugar\b|\bVitamin|\bZinc|\bIron|\bOmega [A-Z]+\b)\s*:?\s*([\d\.]+)\s*(g|mg|%|IU)?/g;
//                     const matches = text.matchAll(nutrientRegex);
//                     const nutrients = {};
                    
//                     for (const match of matches) {
//                       const name = match[1].toLowerCase().replace(/\s+/g, '_');
//                       const amount = parseFloat(match[2]);
//                       const unit = match[3] ? match[3] : '';
                      
//                       nutrients[name] = { amount, unit };
//                     }
//                     // console.log(nutrients)
//                     return nutrients;
//                 }

//                 let nutritionFacts = extractNutrients(output.content);
                
//                 return nutritionFacts;
//             })
//             .catch(function (error) {
//                 console.log(error, 'error in calling chat completion');
//             });
//         return completion
//     } catch (e) {
//         console.log(e, ' error in the callChatGTP function')
//     }
// }

async function generateInitialSceenDescription(input) {
    console.log("# - STEP 3 A")
    console.log(input)
    try {
        let data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": `You are a nutrition expert who specializes in nutrition for children under the age of 2 years old.` },
                { "role": "user", "content": `Can you provide the nutritional values for ${input.search.description} considering the quantity ${input.quantity} and measurement type ${input.measurement}?` },
                { "role": "user", "content": `1 serving of ${input.search.description} = ` },

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
                // console.log(JSON.stringify(response.data));
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



module.exports = { handleIncomingMessage }