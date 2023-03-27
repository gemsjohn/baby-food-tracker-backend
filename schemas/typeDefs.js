// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`

  type User {
    _id: ID
    role: [String]
    username: String
    email: String
    tracker: [Tracker]
    resetToken: String
    resetTokenExpiry: String
    currentVersion: String
    tokens: String
  }

  type Food {
    _id: ID
    item: String
    nutrients: String
    foodGroup: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Tracker {
    _id: ID,
    date: String
    entry: [Entry]
  }

  type Entry {
    _id: String
    date: String
    schedule: String
    item: String
    amount: String
    emotion: String
    nutrients: String
    foodGroup: String
  }

  type Query {
    me: User
    users(echo: String): [User]
    user(_id: ID!): User
    trackers(echo: String): [Tracker]
    foods: [Food]
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
      tracker: String
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

    requestReset(
      email: String
    ): User

    resetPassword(
      email: String
      password: String
      confirmPassword: String
      resetToken: String
    ): User

    addEntry(
      date: String
      schedule: String
      item: String
      amount: String
      emotion: String
      nutrients: String
      foodGroup: String
    ): Entry

    deleteEntry(id: ID!, userid: String): String

    addFood(
      item: String
      nutrients: String
      foodGroup: String
    ): Food

    editFood(
      foodid: String
      item: String
      nutrients: String
      foodGroup: String
    ): Food

    deleteFood(id: ID!): String
    
  }
  
`;

// export the typeDefs
module.exports = typeDefs;