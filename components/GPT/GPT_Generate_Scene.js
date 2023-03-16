const { deliverPlot } = require('../plot');
const { GPT_Scene_Description } = require('./GPT_Scene_Description');
const { GPT_Input_Response } = require('./GPT_Input_Response');

async function handleIncomingMessage(input, supplementalData) {
    console.log("# - STEP 3 A")
    const response = await generateInitialSceenDescription(input, supplementalData);
    return response;
  }
  
  async function handleDecision(input, supplementalData) {
    console.log("# - STEP 3 B")
    const response = await generateSubsequentScene(input, supplementalData);
    return response;
  }
  
  async function handleCustomUserInput(input, supplementalData) {
    console.log("# - STEP 3 C")
    const response = await generateResponseToCustomUserInput(input, supplementalData);
    return response;
  }

async function generateInitialSceenDescription(input, supplementalData) {
    console.log("# - STEP 5 A")
    const plot = deliverPlot(supplementalData)
    const scene = plot.find(scene => scene.id === 1);
    const response = await GPT_Scene_Description(scene.text, scene.goal, scene.decision, scene.options)

    let content = {
        "res": response.content,
        "sceneID": 1,
        "decision": scene.decision,
        "options": scene.options

    }
    // Return the generated narrative description
    return content;
}

async function generateSubsequentScene(input, supplementalData) {
    console.log("# - STEP 5 B")
    console.log(input)
    const plot = deliverPlot(supplementalData)
    const scene = plot.find(scene => scene.id === input);
    const response = await GPT_Scene_Description(scene.text, scene.goal, scene.decision, scene.options)

    let content = {
        "res": response.content,
        "sceneID": input,
        "decision": scene.decision,
        "options": scene.options,
    }
    // Return the generated narrative description
    return content;
}

async function generateResponseToCustomUserInput(input, supplementalData) {
    console.log("# - STEP 5 C")
    console.log(input)
    const plot = deliverPlot(supplementalData)
    const scene = plot.find(scene => scene.id === input.currentSceneID);
    const response = await GPT_Input_Response(scene.text, scene.goal, scene.decision, scene.options, input.value)

    let content = {
        "res": response.content,
        "sceneID": input.currentSceneID,
        "decision": '',
        "options": [{ text: "Continue...", nextId: scene.nextId }]

    }
    // Return the generated narrative description
    return content;

}

module.exports = { handleIncomingMessage, handleDecision, handleCustomUserInput }