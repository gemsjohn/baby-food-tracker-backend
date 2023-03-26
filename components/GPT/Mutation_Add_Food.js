const { GraphQLClient, gql } = require('graphql-request')

const Mutation_Add_Food = async (item, nutrients, foodGroup) => {
    // const endpoint = 'http://192.168.1.198:3001/graphql'
    const endpoint = 'https://baby-food-tracker.herokuapp.com/graphql'
    console.log("# - Mutation_Add_Food")
    // console.log(bearerToken)

    const graphQLClient = new GraphQLClient(endpoint)

    const ADD_FOOD = gql`
        mutation Mutation($item: String, $nutrients: String, $foodGroup: String) {
            addFood(item: $item, nutrients: $nutrients, foodGroup: $foodGroup) {
                _id
                item
                nutrients
                foodGroup
            }
        }
    `;

    const variables = { item, nutrients, foodGroup }
    console.log(variables)

    const data = await graphQLClient.request(ADD_FOOD, variables)
    return JSON.stringify(data.addFood)
}

module.exports = {
    Mutation_Add_Food
}