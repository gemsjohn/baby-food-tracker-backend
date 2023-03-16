require('dotenv').config()
const axios = require('axios');

let apiKey = process.env.OPENAI_API_KEY

const GPT_Input_Response = async (scene, goal, decision, options, userInput) => {
    try {
        let data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    "role": "system", 
                    "content": `You are an interactive narrator for a science fiction story. The user has provided a response: ${userInput} to this decision/question: ${decision}. ` 
                },
                { 
                    "role": "user", 
                    "content": `Write a complete sentance reacting to the user response: ${userInput} considering the current scene: ${scene} and associated decision/question that the user has responded too: ${decision}.` 
                },
            ],
            max_tokens: 60
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
                return output
            })
            .catch(function (error) {
                console.log(error, 'error in calling chat completion');
            });
        return completion
    } catch (e) {
        console.log(e, ' error in the callChatGTP function')
    }
}

module.exports = {
    GPT_Input_Response
}


