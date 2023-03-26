const { GraphQLClient, gql } = require('graphql-request')

const Query_Foods = async (item) => {
    // const endpoint = 'http://192.168.1.198:3001/graphql'
    const endpoint = 'https://baby-food-tracker.herokuapp.com/graphql'
    console.log("# - Query_Food")
    // console.log(bearerToken)

    const graphQLClient = new GraphQLClient(endpoint)

    const FOODS = gql`
        query Foods {
            foods {
                _id
                item
                nutrients
                foodGroup
            }
        }
    `;


    const data = await graphQLClient.request(FOODS)
    // console.log(data)

    let foodItem = item;
    console.log(item)
    foodItem = foodItem.toUpperCase();

    for (let i = 0; i < data.foods.length; i++) {
        if (data.foods[i].item == foodItem) {
            return data.foods[i].nutrients;
        }
    }
    // return JSON.stringify(data.FOODS)
}

module.exports = {
    Query_Foods
}