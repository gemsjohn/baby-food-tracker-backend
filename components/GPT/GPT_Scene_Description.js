require('dotenv').config()
const axios = require('axios');

let apiKey = process.env.OPENAI_API_KEY

const GPT_Scene_Description = async (scene, goal, decision, options) => {
    try {
        let data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": `You are an interactive narrator for science fiction story. The user gets to make the decisions: ${decision} and in some cases the user gets to choose from a set of options: ${options}. Do not use character or location names unless they are provided otherwise you may interfere with the plot.` },
                { "role": "user", "content": `Write a paragraph describing this scene: ${scene} for a science fiction story. Include the goal: ${goal} of this scene. Begin your paragraph with a clear and concise topic sentence that sets the stage for the scene. Use descriptive language to paint a vivid picture of the setting. End your paragraph with a concluding sentence that ties together the description and leaves the reader with a complete thought.` },
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
    GPT_Scene_Description
}


