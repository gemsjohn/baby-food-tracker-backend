const { GraphQLClient, gql } = require('graphql-request')

const Query_Foods = async (item) => {
    const endpoint = 'http://192.168.1.198:3001/graphql'
    // const endpoint = 'https://baby-food-tracker.herokuapp.com/graphql'
    console.log("# - QUERY_FOODS: CHECK DB TO SEE IF FOOD EXISTS.")
    // console.log(bearerToken)

    const graphQLClient = new GraphQLClient(endpoint)

    const GET_FOOD = gql`
    query Food($item: String) {
      food(item: $item) {
        _id
        item
        foodGroup
        nutrients {
          servingWeight {
            amount
            unit
          }
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
      }
    }
  `;



const data = await graphQLClient.request(GET_FOOD, { item: item })
console.log(data)
}

module.exports = {
    Query_Foods
}