require('dotenv').config();
const { AuthenticationError } = require('apollo-server-express');
const { User, Story, Chat } = require("../models");
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
    stories: async (parent, args, context) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          return Story.find()
        }
      } else {
        return null;
      }

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
          story: [],
          tokens: 1,
        }
      );
      const token = signToken(user);
      return { token, user };
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

      // throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
    },
    updateStoryContent: async (parents, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        console.log(args)

        if (context.user) {
          await User.findByIdAndUpdate(
            { _id: context.user._id },
            {
              candidate: args.candidate,
            },
            { new: true }
          )
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    updateTokenCount: async (parents, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }
        console.log("#1")

        const user = await User.findById({ _id: args.userid })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        console.log("#2")


        if (args.remove === "true" && user.tokens <= 0) {
          throw new ApolloError('Insufficient tokens', 'INSUFFICIENT_TOKENS')
        }
        console.log("#3")

        const amount = Number(args.amount)
        console.log(amount)
        if (isNaN(amount) || amount < 0) {
          throw new ApolloError('Invalid amount provided', 'INVALID_INPUT')
        }
        console.log("#4")


        if (args.add !== "true" && args.add !== "false") {
          throw new ApolloError('Invalid add argument provided', 'INVALID_INPUT')
        }
        console.log("#5")


        if (args.remove !== "true" && args.remove !== "false") {
          throw new ApolloError('Invalid remove argument provided', 'INVALID_INPUT')
        }
        console.log("#6")

        console.log("updateTokenCount")
        if (user.tokens > 0 && args.remove == "true") {
        console.log("#8")

          await User.findByIdAndUpdate(
            { _id: args.userid },
            {
              tokens: user.tokens - 1
            },
            { new: true }
          )
        }
        if (args.add == "true" && Number(args.amount) > 0) {
        console.log("#9")

          const updateTokens = Number(user.tokens) + Number(args.amount);
          console.log(args.add)
          await User.findByIdAndUpdate(
            { _id: args.userid },
            {
              tokens: updateTokens
            },
            { new: true }
          )
        }

      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }

      // throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
    },
    addChat: async (parent, args, context) => {
      const user = await User.findById({ _id: context.user._id })
      if (!user) {
        throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
      }

      if (!args.npc || !args.user) {
        throw new Error('Missing required fields');
      }

      if (user.story[args.chapter] == null) {

        console.log("mutation/addChat/new_chat")
        const chat = new Chat({
          npc: args.npc,
          user: args.user
        });
        await chat.save();


        const story = new Story({
          userid: user._id,
          chat: chat
        });
        await story.save();

        await User.findByIdAndUpdate(
          { _id: user._id },
          {
            $push: {
              story: story
            }
          },
          { new: true }
        )
      } else if (user.story[args.chapter] != null) {
        console.log("mutation/addChat/existing_chat")
        console.log(args.chapter)
        // await User.findByIdAndUpdate(
        //   {_id: context.user._id},
        //   {
        //     story: []
        //   },
        //   { new: true }
        // )

        const chat = new Chat({
          npc: args.npc,
          user: args.user
        });
        await chat.save();

        let storyID = user.story[args.chapter]._id;
        console.log(storyID)

        console.log("mutation/addChat/existing_chat/push_chat")
        const story = await Story.findByIdAndUpdate(
          { _id: storyID },
          {
            
            $push: {
              chat: chat
            }
          },
          { new: true }
        )

        console.log("mutation/addChat/existing_chat/update_user")
        await User.findOneAndUpdate(
          { _id: user._id, "story._id": storyID },
          {
              "story.$": story,
            
          },
          { new: true }
        );

      }
      return {};
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

        // const saltRounds = 10;
        // const hash = await bcrypt.hash(args.echo, saltRounds);

        // if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        //   if (context.user.role[0] === 'Admin') {
        console.log("deleteUser")

        if (context.user._id == args.id || context.user.role[0] == 'Admin') {
          const user = await User.findOne({ _id: args.id })

          for (let i = 0; i < user.story.length; i++) {
            await Story.findByIdAndDelete({ _id: user.story[i]._id })
          }

          await User.findByIdAndDelete({ _id: args.id })
        } else {
          return null;
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }

    },

  }
};

module.exports = resolvers;