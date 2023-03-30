const { GraphQLClient, gql } = require('graphql-request')

const Query_Foods = async (item) => {
    // const endpoint = 'http://192.168.1.198:3001/graphql'
    const endpoint = 'https://baby-food-tracker.herokuapp.com/graphql'
    console.log("# - QUERY_FOODS: CHECK DB TO SEE IF FOOD EXISTS.")
    // console.log(bearerToken)

    const graphQLClient = new GraphQLClient(endpoint)

    const FOODS = gql`
    query Query {
      foods {
        _id
        item
        nutrients {
              calories {
                amount
                unit
              }
              protein {
                amount
                unit
              }
              fat {
                amount
                unit
              }
              carbohydrates {
                amount
                unit
              }
              fiber {
                amount
                unit
              }
              sugar {
                amount
                unit
              }
              iron {
                amount
                unit
              }
              zinc {
                amount
                unit
              }
              omega3 {
                amount
                unit
              }
              vitaminD {
                amount
                unit
              }
            }
        foodGroup
      }
    }
  `;



    const data = await graphQLClient.request(FOODS)
    console.log(data)
    // let foodItem = item;
    // foodItem = foodItem.toUpperCase();

    // for (let i = 0; i < data.foods.length; i++) {
    //     console.log(data.foods[i])
    //     // if (data.foods[i].item == foodItem) {
    //     //     return data.foods[i];
    //     // }
    // }
}

module.exports = {
    Query_Foods
}