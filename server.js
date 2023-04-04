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
const { getNutritionDetailsAndFoodGroup, handleIdentifyFoodGroup } = require('./components/GPT/GPT_Generate_Scene');
const { convertNutrition } = require('./components/GPT/Convert_v0');
const axios = require('axios');
// const { Mutation_Add_Food } = require('./components/GPT/Mutation_Add_Food');
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

// app.post('/query-usda/:prompt', (req, res) => {
//   const userInput = req.params.prompt;
//   let userInputParsed = JSON.parse(decodeURIComponent(userInput));
//   console.log(userInputParsed)

//   axios.get(`https://api.nal.usda.gov/fdc/v1/search?api_key=${process.env.USDA_API_KEY}&generalSearchInput=${userInputParsed.search}&pageSize=20&fields=description,labelNutrients`)
//     .then((response) => {

//       const foods = response.data.foods
//         .filter((food) => food.description && food.description.trim().length > 0)
//         .reduce((uniqueFoods, food) => {
//           const formattedDescription = food.description
//             .toLowerCase()
//             .replace(/\b\w/g, (l) => l.toUpperCase());
//           if (
//             !uniqueFoods.find(
//               (uniqueFood) => uniqueFood.description === formattedDescription
//             )
//           ) {
//             uniqueFoods.push({
//               fdcId: food.fdcId,
//               description: formattedDescription,
//             });
//           }
//           return uniqueFoods;
//         }, []);

//       res.status(200).json({ result: foods });
//     })
//     .catch((error) => {
//       console.log(error);
//     });

// })

app.post('/query-nutritionix/:prompt', (req, res) => {
  const userInput = req.params.prompt;
  let userInputParsed = JSON.parse(decodeURIComponent(userInput));
  console.log(userInputParsed)
  const appId = process.env.NUTRITIONIXAP_APP_ID;
  const appKey = process.env.NUTRITIONIXAP_APP_KEY;
  axios.get(`https://api.nutritionix.com/v1_1/search/${userInputParsed.search}?results=0:1&fields=item_name,brand_name,item_id,nf_calories,nf_protein,nf_total_fat,nf_saturated_fat,nf_cholesterol,nf_sodium,nf_total_carbohydrate,nf_dietary_fiber,nf_sugars,nf_iron_dv,nf_zinc_dv,nf_omega_3_dv,nf_vitamin_d_dv,nf_serving_weight_grams&appId=${appId}&appKey=${appKey}`)
    .then((response) => {

      const foods = response.data.hits
        .filter((food) => food.fields.item_name && food.fields.item_name.trim().length > 0)
        .reduce((uniqueFoods, food) => {
          const formattedDescription = `${food.fields.item_name}`;

          if (
            !uniqueFoods.find(
              (uniqueFood) => uniqueFood.description === formattedDescription
            )
          ) {
            uniqueFoods.push({
              itemId: food.fields.item_id,
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
});





app.post(`/api/npc/:prompt`, async (req, res) => {
  const userInput = req.params.prompt;
  let userInputParsed = JSON.parse(decodeURIComponent(userInput));

  console.log("# - STEP 1 USER INPUT:");
  console.log(userInputParsed)

  if (!res.headersSent && userInputParsed.search.description != '') {
    console.log("# - STEP 2 MAIN")
    const searchFood = async (foodItem) => {
      const appId = process.env.NUTRITIONIXAP_APP_ID;
      const appKey = process.env.NUTRITIONIXAP_APP_KEY;
      const url = `https://api.nutritionix.com/v1_1/search/${foodItem}?results=0:1&fields=item_name,brand_name,item_id,nf_calories,nf_protein,nf_total_fat,nf_saturated_fat,nf_cholesterol,nf_sodium,nf_total_carbohydrate,nf_dietary_fiber,nf_sugars,nf_iron_dv,nf_zinc_dv,nf_omega_3_dv,nf_vitamin_d_dv,nf_serving_weight_grams&appId=${appId}&appKey=${appKey}`;

      try {
        const response = await axios.get(url);
        const foodData = response.data.hits[0].fields;
        console.log(response.data.hits[0])
        return {
          itemName: foodData.item_name,
          brandName: foodData.brand_name,
          nutrients: {
            servingWeight: {
              amount: foodData.nf_serving_weight_grams || '',
              unit: 'g'
            },
            calories: {
              amount: foodData.nf_calories || '',
              unit: ''
            },
            protein: {
              amount: foodData.nf_protein || '',
              unit: 'g'
            },
            fat: {
              amount: foodData.nf_total_fat || '',
              unit: 'g'
            },
            carbohydrates: {
              amount: foodData.nf_total_carbohydrate || '',
              unit: 'g'
            },
            fiber: {
              amount: foodData.nf_dietary_fiber || '',
              unit: 'g'
            },
            sugar: {
              amount: foodData.nf_sugars || '',
              unit: 'g'
            },
            iron: {
              amount: foodData.nf_iron_dv || '',
              unit: '%'
            },
            zinc: {
              amount: foodData.nf_zinc_dv || '',
              unit: '%'
            },
            omega3: {
              amount: foodData.nf_omega_3_dv || '',
              unit: '%'
            },
            vitaminD: {
              amount: foodData.nf_vitamin_d_dv || '',
              unit: '%'
            }
          }
        };
      } catch (error) {
        console.error(error);
        return null;
      }

    }

    searchFood(userInputParsed.search.description).then(data => {
      console.log("# - NUTRITIONIX")
      console.log(data);
      if (data) {
        handleData(data)
      } else {
        res.status(200).json({ result: "not found" });
      }



    });

    const handleData = async (data) => {
      response = await getNutritionDetailsAndFoodGroup(userInputParsed);
      if (response.foodGroup && response.foodGroup.group && JSON.stringify(response.foodGroup.group)) {
        foodGroup = JSON.stringify(response.foodGroup.group);
      } else {
        foodGroup = ''
      }
      res.status(200).json({ result: { conversion: data, foodGroup: foodGroup } });
    }

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

