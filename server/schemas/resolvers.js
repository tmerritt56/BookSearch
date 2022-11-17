const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        user: async (parent,args,context) => {
            if (context.user){
                const userData = await User.findOne({_id:context.user._id}).select('-__v -password');
                return userData;
            }
            throw new AuthenticationError('Log in, please <3');
        },
    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user){
                throw new AuthenticationError("Username or Password invalid");
            }
            const correctPassword = await user.isCorrectPassword(password);
            
            if(!correctPassword) {
                throw new AuthenticationError("Invalid Username or Password");
            }

            const token = signToken(user);
            return { token, user};
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user};
        },

        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updateUser = await User.findOneandUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: {bookId: args.bookId}}}, 
                    {new:true}
                );
                return updatedUser;
            }
            throw new AuthenticationError("You are not logged in.");
        },
        saveBook: async (parent, {input}, context) => {
            if (context.user) {
                const updatedUser = await User.findOneandUpdate(
                    {_id: context.user._id},
                    {$addToSet: { savedBooks: input}},
                    {new: true}
                );
                return updatedUser;
            }
            throw new AuthenticationError('Please log in.');
        },

    },

};
module.exports = resolvers; 