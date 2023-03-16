// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`

  type User {
    _id: ID
    role: [String]
    username: String
    email: String
    story: [Story]
    resetToken: String
    resetTokenExpiry: String
    currentVersion: String
    candidate: String
    storySummary: String
    tokens: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Story {
    _id: ID,
    userid: String
    chat: [Chat]
  }

  type Chat {
    _id: String
    npc: String
    user: String
  }


  type Query {
    me: User
    users(echo: String): [User]
    user(_id: ID!): User
    stories(echo: String): [Story]
  }

  type Mutation {
    login(
      username: String!, 
      password: String!
    ): Auth

    addUser(
      role: [String!],
      username: String!, 
      email: String!,
      story: String
      password: String!,
      tokens: String
    ): Auth

    deleteUser(id: ID!): String

    updateUser(
      username: String, 
      email: String,
    ): User

    updateTokenCount(
      userid: String,
      remove: String,
      add: String,
      amount: String
    ): User
    
    updateUserPassword(
      password: String
    ): User

    updateStoryContent(
      candidate: String,
    ): User

    requestReset(
      email: String
    ): User

    resetPassword(
      email: String
      password: String
      confirmPassword: String
      resetToken: String
    ): User

    addChat(
      chapter: String
      npc: String
      user: String
    ): Chat
    
    deleteStory(id: ID!, echo: String): String
  }
  
`;

// export the typeDefs
module.exports = typeDefs;