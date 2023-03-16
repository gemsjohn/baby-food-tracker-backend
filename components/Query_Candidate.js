const { GraphQLClient, gql } = require('graphql-request')

const Query_Candidate = async (bearerToken) => {
    const endpoint = 'http://192.168.1.198:3001/graphql'
    console.log("# - QUERY CANDIDATE")
    // console.log(bearerToken)

    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            authorization: `${bearerToken}`,
        },
    })

    const GET_ME = gql`
        query Query {
        me {
        _id
        role
        username
        email
        story {
            _id
            userid
            chat {
            _id
            npc
            user
            }
        }
        resetToken
        resetTokenExpiry
        currentVersion
        candidate
        storySummary
        }
    }
    `;

    const data = await graphQLClient.request(GET_ME)
    return JSON.stringify(data.me.candidate)
}

module.exports = {
    Query_Candidate
}