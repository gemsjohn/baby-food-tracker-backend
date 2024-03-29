// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`
  type Auth {
    token: ID!
    user: User
  }

  type User {
    _id: ID
    role: [String]
    username: String
    email: String
    resetToken: String
    resetTokenExpiry: String
    currentVersion: String
    premium: Premium
    subuser: [SubUser]
  }

  type Premium {
    status: Boolean,
    expiration: String
  }

  type SubUser {
    _id: ID
    subusername: String
    allergy: [String]
    tracker: [Tracker]
    meal: [Meal]
  }

  type Tracker {
    _id: ID,
    date: String
    entry: [Entry]
  }

  type Entry {
    _id: String
    subuserid: String
    date: String
    schedule: String
    time: String
    item: String
    amount: String
    emotion: String
    nutrients: Nutrients
    foodGroup: String
    allergy: String
  }

  type Food {
  _id: ID
  item: String
  foodGroup: String
  nutrients: Nutrients
  
}

type Nutrients {
  servingWeight: NutrientValue
  calories: NutrientValue
  protein: NutrientValue
  fat: NutrientValue
  carbohydrates: NutrientValue
  fiber: NutrientValue
  sugar: NutrientValue
  iron: NutrientValue
  zinc: NutrientValue
  omega3: NutrientValue
  vitaminD: NutrientValue,
}

type NutrientValue {
  amount: Float
  unit: String
}

type Meal {
  _id: ID
  title: String
}


  type Query {
    me: User
    users(echo: String): [User]
    user(_id: ID!): User
    trackers(echo: String): [Tracker]
    foods: [Food]
    food(item: String): Food
  }

  type Mutation {
    login(
      username: String!, 
      password: String!
    ): Auth

    addUser(
      role: [String!]
      username: String!
      email: String!
      password: String!
      premium: String
      subuser: [String]
    ): Auth

    updateUser(
      username: String, 
      email: String,
    ): User
    
    updatePremium(
      status: Boolean,
      expiration: String
    ): User

    updateCurrentVersion(
      currentVersion: String
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

    deleteUser(id: ID!): String
    
    addSubUser(
      subusername: String
    ): SubUser

    updateSubUserAllergies(
      subuserid: String
      item: String
    ): SubUser

    addNutrients(
      servingWeight: String
      calories: String
      protein: String
      fat: String
      carbohydrates: String
      fiber: String
      sugar: String
      iron: String
      zinc: String
      omega3: String
      vitaminD: String
    ): Nutrients

    addSubUserEntry(
      subuserid: String
      date: String
      schedule: String
      time: String
      item: String
      amount: String
      emotion: String
      nutrients: [String]
      foodGroup: String
      allergy: String
      foodInDb: Boolean
    ): Entry

    deleteEntry(id: ID!, userid: String, subuserid: String): String
    deleteSubUser(userid: ID!, subuserid: ID!): String

    addFood(
      item: String
      nutrients: [String]
      foodGroup: String
    ): Food

    editFood(
      foodid: String
      nutritioncategory: String
      amount: String
      unit: String
      foodGroup: String
    ): Food

    deleteFood(id: ID!): String

    sendPDFContent(
      email: String
      html: String
    ): User
    
  }
  
`;

// export the typeDefs
module.exports = typeDefs;