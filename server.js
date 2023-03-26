require('dotenv').config();
const express = require('express');
const { ApolloServerPluginLandingPageLocalDefault } = require('apollo-server-core');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
var cors = require('cors');
const { typeDefs, resolvers, permissions } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
const jwt = require('jsonwebtoken');
const { handleIncomingMessage, handleIncomingMessage_FoodGroup } = require('./components/GPT/GPT_Generate_Scene');
const { convertNutrition } = require('./components/GPT/Convert');
const axios = require('axios');
const { Mutation_Add_Food } = require('./components/GPT/Mutation_Add_Food');
const { Query_Foods } = require('./components/GPT/Query_Foods');

const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (err) => {
    // Don't give the specific errors to the client
    if (err.message.startsWith('Database Error: ')) {
      return new Error('Internal server error');
    }
    // Otherwise return the original error
    return err;
  },
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
  context: authMiddleware
});

const app = express();
app.use(cors())

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const validateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, `${process.env.REACT_APP_SECRET}`, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
}

app.get('/protected-route', validateToken, (req, res) => {
  // The request is authenticated. Send the protected data.
  res.send({ data: 'protected data' });
});

app.get('/ping', (req, res) => {
  console.log("ping")
  res.send({ data: 'Success' })
})

app.post('/query-usda/:prompt', (req, res) => {
  const userInput = req.params.prompt;
  let userInputParsed = JSON.parse(decodeURIComponent(userInput));
  console.log(userInputParsed)

  axios.get(`https://api.nal.usda.gov/fdc/v1/search?api_key=${process.env.USDA_API_KEY}&generalSearchInput=${userInputParsed.search}&pageSize=20&fields=description,labelNutrients`)
    .then((response) => {
      const foods = response.data.foods
        .filter((food) => food.description && food.description.trim().length > 0)
        .reduce((uniqueFoods, food) => {
          const formattedDescription = food.description
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
          if (
            !uniqueFoods.find(
              (uniqueFood) => uniqueFood.description === formattedDescription
            )
          ) {
            uniqueFoods.push({
              fdcId: food.fdcId,
              description: formattedDescription,
            });
          }
          return uniqueFoods;
        }, []);

        res.status(200).json({ result: foods });
    })
    .catch((error) => {
      console.log(error);
    });
  
})


app.post(`/api/npc/:prompt`, async (req, res) => {
  console.log("# - STEP 1")

  const userInput = req.params.prompt;
  let userInputParsed = JSON.parse(decodeURIComponent(userInput));

  console.log("# - USER INPUT:");
  console.log(userInputParsed)

  if (!res.headersSent && userInputParsed.search.description != '') { 
      console.log("# - MAIN")
      async function main() {
        let response;
        let conversion;
        let foodNutrients = await Query_Foods(userInputParsed.search.description);
        
        if (foodNutrients) {
          console.log("# - FOOD DATA EXISTS: TRUE")
          response = await handleIncomingMessage_FoodGroup(userInputParsed)
          foodNutrients = JSON.parse(foodNutrients);
          conversion = convertNutrition(foodNutrients, userInputParsed.quantity, userInputParsed.measurement);
          console.log(response.foodGroup)
          // res.status(200).json({ result: conversion });
          res.status(200).json({ result: {conversion: conversion, foodGroup: response.foodGroup.group} });

        } else {
          console.log("# - FOOD DATA EXISTS: FALSE")
          response = await handleIncomingMessage(userInputParsed);
          console.log(response)
          if (response.nutrition.calories.amount) {
            let foodGroup;
            if (response.foodGroup && response.foodGroup.group && JSON.stringify(response.foodGroup.group)) {
              foodGroup = JSON.stringify(response.foodGroup.group);
            } else {
              foodGroup = ''
            }
            await Mutation_Add_Food(userInputParsed.search.description, JSON.stringify(response.nutrition), foodGroup)
            conversion = convertNutrition(response.nutrition, userInputParsed.quantity, userInputParsed.measurement);
            console.log("# - PRE-RES-STATUS:")
            console.log(foodGroup)
            // res.status(200).json({ result: conversion });
            res.status(200).json({ result: {conversion: conversion, foodGroup: foodGroup} });
          } else {
            res.status(200).json({ result: "not found" });
          }
        }
        
      }
      main();
  }

});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  // Serve up static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://192.168.1.198:${PORT}${server.graphqlPath}`);
    })
  })
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);

