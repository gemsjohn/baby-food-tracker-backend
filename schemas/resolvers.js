require('dotenv').config();
const { AuthenticationError } = require('apollo-server-express');
const { User, Tracker, Entry, Food, SubUser, Nutrients, Nutrient_Details } = require("../models");
const { signToken, clearToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const moment = require('moment');
const axios = require('axios');
const { promisify } = require("es6-promisify");
const randomBytes = require('randombytes');
const nodemailer = require("nodemailer");
const Sequelize = require('sequelize');
const GenerateCryptoRandomString = require('../CryptoRandomString');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
        return userData;
      }
      // throw new AuthenticationError('Not logged in');
    },
    // users
    users: async (parent, args, context) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          return User.find()
        }
      } else {
        return null;
      }


    },
    // single user by username
    user: async (parent, args, context) => {
      if (context.user._id === args._id || context.user.role[0] === 'Admin') {
        return User.findOne({ _id: args._id })
      }
    },
    trackers: async (parent, args, context) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          return Tracker.find()
        }
      } else {
        return null;
      }

    },
    foods: async () => {
      return Food.find();
    },
  },
  

  Mutation: {
    login: async (parent, { username, password, role }) => {
      console.log("LOGIN")
      let lowerCaseUsername = username.toLowerCase();
      const user = await User.findOne({ username: lowerCaseUsername.replace(/\s/g, '') });
      const permission = await User.find({ role });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user, permission };
    },
    addUser: async (parent, args) => {
      console.log("ADD USER")
      let lowerCaseUsername = args.username.toLowerCase();
      let lowerCaseEmail = args.email.toLowerCase();
      let filteredUsername = lowerCaseUsername.replace(/\s+/g, '');
      let filteredEmail = lowerCaseEmail.replace(/\s+/g, '');

      const user = await User.create(
        {
          role: 'User',
          email: filteredEmail,
          username: filteredUsername,
          password: args.password,
          premium: false,
          subuser: []
        }
      );
      const token = signToken(user);
      return { token, user };
    },
    addSubUser: async (parent, args, context) => {
      console.log("# - addSubUser CHECK 1")
      if (!context.user) {
        throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
      }
      console.log("# - addSubUser CHECK 2")

      const user = await User.findById({ _id: context.user._id })
      if (!user) {
        throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
      }
      console.log("# - addSubUser CHECK 3")

      if (!user.premium) {
        throw new ApolloError('Premium service false', 'ADD_SUBUSER_FAILED')
      }
      console.log("ADD SUBUSER")
      let lowerCaseUsername = args.subusername.toLowerCase();
      let filteredUsername = lowerCaseUsername.replace(/\s+/g, '');

      const subuser = await SubUser.create(
        {
          subusername: filteredUsername,
          tracker: [],
          allergy: []
        }
      );

      await User.findByIdAndUpdate(
        { _id: context.user._id },
        {
          $push: {
            subuser: subuser,
          }
        },
        { new: true }
      )
      return { subuser };
    },
    updateUser: async (parents, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        console.log(args)
        let lowerCaseUsername = args.username.toLowerCase();
        let lowerCaseEmail = args.email.toLowerCase();
        let filteredUsername = lowerCaseUsername.replace(/\s+/g, '');
        let filteredEmail = lowerCaseEmail.replace(/\s+/g, '');
        if (context.user) {
          await User.findByIdAndUpdate(
            { _id: context.user._id },
            {
              role: context.user.role,
              username: filteredUsername,
              email: filteredEmail,
            },
            { new: true }
          )
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    updatePremium: async (parents, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        console.log("updatePremium")
        if (context.user) {
          await User.findByIdAndUpdate(
            { _id: context.user._id },
            {
              premium: args.premium
            },
            { new: true }
          )
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    
    updateUserPassword: async (parent, { password }, context) => {
      console.log(context.user)
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        if (context.user) {
          const result = await User.findByIdAndUpdate(
            { _id: context.user._id },
            {
              password: hash,
              resetToken: null,
              resetTokenExpiry: null
            },
            {
              where: { _id: context.user._id },
              returning: true,
              plain: true
            }
          );
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    addSubUserEntry: async (parent, args, context) => {
      console.log("# - addSubUserEntry CHECK 1")
      const user = await User.findById({ _id: context.user._id })
      if (!user) {
        throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
      }
      console.log("# - addSubUserEntry CHECK 2")

      let upperCaseItem = args.item.toUpperCase();

      let parsedNutrients = JSON.parse(args.nutrients)

      const nutrients = new Nutrients({
        calories: JSON.stringify(parsedNutrients.calories),
        protein: JSON.stringify(parsedNutrients.protein),
        fat: JSON.stringify(parsedNutrients.fat),
        carbohydrates: JSON.stringify(parsedNutrients.carbohydrates),
        fiber: JSON.stringify(parsedNutrients.fiber),
        sugar: JSON.stringify(parsedNutrients.sugar),
        iron: JSON.stringify(parsedNutrients.iron),
        zinc: JSON.stringify(parsedNutrients.zinc),
        omega3: JSON.stringify(parsedNutrients.omega3),
        vitaminD: JSON.stringify(parsedNutrients.vitaminD)
      })

      console.log("# - addSubUserEntry CHECK 3")

      console.log(nutrients)

      const entry = new Entry({
        subuserid: args.subuserid,
        date: args.date,
        schedule: args.schedule,
        time: args.time,
        item: upperCaseItem,
        amount: args.amount,
        emotion: args.emotion,
        nutrients: nutrients,
        foodGroup: args.foodGroup,
        allergy: args.allergy
      });
      await entry.save();
      console.log("# - addSubUserEntry CHECK 4")


      const tracker = new Tracker({
        date: args.date,
        entry: entry
      });
      await tracker.save();

      console.log("# - addSubUserEntry CHECK 5")

      for (let i = 0; i < user.subuser.length; i++) {
        console.log("# - addSubUserEntry CHECK 6")
        if (user.subuser[i]._id == args.subuserid) {
          let subuser = user.subuser[i]
          console.log("# - addSubUserEntry CHECK 7")
          // Find the index of the subuser in the user's subuser array
          const subuserIndex = user.subuser.findIndex((subuser) => subuser._id == args.subuserid);

          console.log("# - addSubUserEntry CHECK 8 - SUBUSERNAME: " + subuser.subusername)
          // Update the subuser in the user's subuser array

          const allergies = user.subuser[subuserIndex].allergy;

          user.subuser[subuserIndex] = {
            ...user.subuser[subuserIndex],
            _id: subuser._id,
            subusername: subuser.subusername,
            tracker: [...user.subuser[subuserIndex].tracker, tracker],
            allergy: args.allergy === "Mild" || args.allergy === 'Strong' ?
                !allergies.includes(upperCaseItem) ?
                  [...user.subuser[subuserIndex].allergy, upperCaseItem] :
                  user.subuser[subuserIndex].allergy
                :
                user.subuser[subuserIndex].allergy
          };

          // Save the updated user object
          await user.save();
        }
      }
      const food = await Food.findOne({ item: upperCaseItem })
      if (food) {
        console.log("# - " + upperCaseItem + " ALREADY EXISTS IN THE FOOD DB")
      } else {
        console.log("# - ADDING " + upperCaseItem + " TO THE FOOD DB")
        const food = new Food({
          item: upperCaseItem,
          nutrients: nutrients,
          foodGroup: args.foodGroup,
        });
        await food.save();
      }

      return {};
    },
    deleteEntry: async (parent, args, context) => {
      try {
        console.log("# - deleteEntry CHECK 1")
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }
    
        console.log("# - deleteEntry CHECK 2")
        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
    
        console.log("# - deleteEntry CHECK 3")
        console.log(args.id)
    
        for (let i = 0; i < user.subuser.length; i++) {
          if (user.subuser[i]._id == args.subuserid) {
            console.log("# - deleteEntry CHECK 4")
            let subuser = user.subuser[i]
            console.log(subuser._id)
    
            for (let j = 0; j < subuser.tracker.length; j++) {
              let trackerObject = subuser.tracker[j]
              let trackerObjectID = trackerObject._id;
    
              if (trackerObjectID == args.id) {
                console.log(trackerObjectID)
                await User.findByIdAndUpdate(
                  { _id: user._id},
                  {
                    $pull: {
                      "subuser.$[i].tracker": {
                        _id: args.id
                      }
                    }
                  },
                  {
                    arrayFilters: [{ "i._id": subuser._id }]
                  }
                )
              }
            }
          }
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    updateSubUserAllergies: async (parents, args, context) => {
      try {
        console.log("# - updateSubUserAllergies CHECK 1")
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }
    
        console.log("# - updateSubUserAllergies CHECK 2")
        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
    
        console.log("# - updateSubUserAllergies CHECK 3")
    
        for (let i = 0; i < user.subuser.length; i++) {
          if (user.subuser[i]._id == args.subuserid) {
            console.log("# - updateSubUserAllergies CHECK 4")
            let subuser = user.subuser[i]
            console.log(subuser._id)


    
            for (let j = 0; j < subuser.allergy.length; j++) {
              let allergy = subuser.allergy[j]

              if (allergy == args.item) {

                await User.findByIdAndUpdate(
                  { _id: user._id},
                  {
                    $pull: {
                      "subuser.$[i].allergy": args.item
                    }
                  },
                  {
                    arrayFilters: [{ "i._id": subuser._id }]
                  }
                )
                console.log("#- REMOVE: " + allergy)

              }
            }
          }
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    
    

    requestReset: async (parent, { email }, context) => {
      let lowerCaseEmail = email.toLowerCase();
      const username = `${process.env.SMTP_USERNAME}`
      const password = `${process.env.SMTP_PASSWORD}`
      const user = await User.findOne(
        { email: lowerCaseEmail }
      )
      // console.log(user)

      if (!user) throw new Error("No user found with that email.");

      // Create randomBytes that will be used as a token
      const randomBytesPromisified = promisify(randomBytes);
      const resetToken = (await randomBytesPromisified(20)).toString("hex");
      const resetTokenExpiry = Date.now() + 300000; // 5 minutes from now

      const saltRounds = 10;
      const hash = await bcrypt.hash(resetToken, saltRounds);

      const result = await User.findByIdAndUpdate(
        { _id: user._id },
        {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        },
        { new: true }
      );
      console.log(result)

      let transport = nodemailer.createTransport({
        host: "smtp.dreamhost.com",
        port: 465,
        auth: {
          user: `${username}`,
          pass: `${password}`
        },
        secure: true,
        logger: true,
        debug: true,
      });


      // Email them the token
      const mailRes = await transport.sendMail({
        from: 'admin@honestpatina.com',
        to: user.email,
        subject: "WordLit Password Reset Token",
        // text: 'Honest Patina email reset token: ' + `${resetToken}`,
        html:
          `
          <html>
            <head>
              <style>
                body {
                  background: linear-gradient(to bottom, white, lightgrey );
                  font-family: Arial, sans-serif;
                }
                .message-box {
                  background-color: white;
                  width: 50%;
                  margin: auto;
                  border-radius: 10px;
                  padding: 20px;
                }
                .btn {
                  background-color: blue;
                  font-weight: bold;
                  border: none;
                  color: white;
                  padding: 15px 32px;
                  text-align: center;
                  text-decoration: none;
                  display: inline-block;
                  font-size: 16px;
                  border-radius: 10px;
                }
                h1 {
                  text-align: center;
                }
                p {
                	font-size: 20px
                }
              </style>
            </head>
            <body>
              <h1>WordLit Password Reset</h1>
              <div class="message-box">
                <p>
                Dear ${user.username},
                </p>
                <p>
                  We have received a request to reset your WordLit password. If you did not make this request, you can safely ignore this email.
                </p>
                <p>
                  To reset your password, please copy the following reset token. The token will be invalid after 5 minutes.
                </p>
                <p>
                  <strong>Reset Token: ${resetToken}</strong>
                </p>
                <p>
                  Then, paste the token in the "reset token" box on WordLit.
                </p>
                <p>
                  Best regards,<br>
                  The WordLit Team
                </p>
              </div>
            </body>
          </html>
          `

      });
      console.log(mailRes)

      return true;

    },
    resetPassword: async (parent, { email, password, confirmPassword, resetToken }, { res }) => {
      console.log(resetToken)
      let lowerCaseEmail = email.toLowerCase();
      const Op = Sequelize.Op;

      // check if passwords match
      if (password !== confirmPassword) {
        throw new Error(`Your passwords don't match`);
      }

      // find the user with that resetToken
      // make sure it's not expired
      const user = await User.findOne(
        { resetToken: resetToken },

      );
      console.log(user)

      // throw error if user doesn't exist
      if (!user) {
        throw new Error(
          "Your password reset token is either invalid or expired."
        )
      }
      console.log(Date.now() - user.resetTokenExpiry)
      if (Date.now() > user.resetTokenExpiry) {
        throw new Error(
          "Your password reset token is either invalid or expired."
        )
      }

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      const result = await User.findByIdAndUpdate(
        { _id: user._id },
        {
          password: hash,
          resetToken: "",
          resetTokenExpiry: ""
        }
      );

      console.log(result)


    },
    deleteUser: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }

        console.log("deleteUser")

        if (context.user._id == args.id || context.user.role[0] == 'Admin') {
          const user = await User.findOne({ _id: args.id })

          for (let i = 0; i < user.tracker.length; i++) {
            await Tracker.findByIdAndDelete({ _id: user.tracker[i]._id })
          }

          await User.findByIdAndDelete({ _id: args.id })
        } else {
          return null;
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }

    },
    deleteSubUser: async (parent, args, context) => {
      try {
        console.log("# - deleteSubUser CHECK 1")
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        console.log("# - deleteSubUser CHECK 2")
        const user = await User.findById({ _id: args.userid })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }

        console.log("# - deleteSubUser CHECK 3")

        if (context.user._id == args.userid || context.user.role[0] == 'Admin') {
          console.log("# - deleteSubUser CHECK 4")
          // const subuser = await SubUser.findOne({ _id: args.subuserid })
          // let subuser;
          
          for (let i = 0; i < user.subuser.length; i++) {
            // subuser = await SubUser.findById({ _id: args.subuserid })

            if (user.subuser[i]._id == args.subuserid) {
              let subuser = user.subuser[i]

              for (let i = 0; i < subuser.tracker.length; i++) {
                console.log("# - deleteSubUser CHECK 5 : " + i)
                await Tracker.findByIdAndDelete({ _id: subuser.tracker[i]._id })
              }
    
              await User.findByIdAndUpdate(
                { _id: args.userid },
                {
                  $pull: {
                    subuser: subuser,
                  },
                },
                { new: true }
              );

            }
          }
          

        } else {
          return null;
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }

    },
    // deleteEntry: async (parent, args, context) => {
    //   try {
    //     if (!context.user) {
    //       throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
    //     }
    
    //     const user = await User.findById({ _id: context.user._id })
    //     if (!user) {
    //       throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
    //     }
    
    //     console.log("deleteEntry")
    //     console.log(args.id)

    //     let localID = context.user._id;
    //     if (localID != args.userid) {
    //       throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
    //     }
    
    //     // Remove it using $pull
    //       await SubUser.updateOne(
    //         { _id: args.subuserid },
    //         { $pull: { tracker: { _id: args.id } } }
    //       )
    //   } catch (err) {
    //     throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
    //   }
    // },
    addFood: async (parent, args, context) => {
      console.log("ADD FOOD")
      let foodItem = args.item.toUpperCase();

      const food = await Food.findOne({ item: foodItem })
      console.log("# - food:") 
      console.log(food)
      if (!food) {
        console.log("# - CREATE FOOD")
        await Food.create(
          {
            item: foodItem,
            nutrients: args.nutrients,
            foodGroup: args.foodGroup
          }
        );
      }
      
      return { food };
    },
    editFood: async (parent, args, context) => {
      const { foodid, item, nutritioncategory, specificnutrientdetail, foodGroup } = args;
    
      // Find the food item to edit
      const foodItem = await Food.findById(foodid);
      if (!foodItem) {
        throw new Error(`Food item with id ${foodid} not found`);
      }

    
      // Create a copy of the nutrients object and update only the specified subcategory
      
      let foodUpdate = foodItem.nutrients;
      foodItem.nutrients[nutritioncategory] = specificnutrientdetail;

      
    
      // Update the food item in the database
      const updatedFoodItem = await Food.findByIdAndUpdate(
        foodid,
        { 
          item, 
          nutrients: foodUpdate,
          foodGroup 
        },
        { new: true }
      );
      return updatedFoodItem;
    },
    
    
    deleteFood: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }
    
        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        console.log("before delete food")
        if (user.role[0] = "Admin") {
          console.log("deleteFood")
    
          // Remove it using $pull
          await Food.findByIdAndDelete({ _id: args.id })
        }
        
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    sendPDFContent: async (parent, { email, html }, context) => {
      let lowerCaseEmail = email.toLowerCase();
      const username = `${process.env.SMTP_USERNAME}`
      const password = `${process.env.SMTP_PASSWORD}`

      let transport = nodemailer.createTransport({
        host: "smtp.dreamhost.com",
        port: 465,
        auth: {
          user: `${username}`,
          pass: `${password}`
        },
        secure: true,
        logger: true,
        debug: true,
      });


      // Email them the token
      const mailRes = await transport.sendMail({
        from: 'admin@honestpatina.com',
        to: lowerCaseEmail,
        subject: "PDFGenerator",
        html: html
      });
      console.log(mailRes)

      return true;

    },
    

  },
  

};

module.exports = resolvers;