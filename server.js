const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} = require('graphql')

const app = express();


const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({    // a single book and its details are returned 
    name : "Book",                          //name of the object that we are requesting
    description : "Returns the details of a book",
    fields: ()=>({                          //writing fields as function for function hoisting
        id: { type :GraphQLNonNull(GraphQLInt)},
        name:{ type : GraphQLNonNull(GraphQLString)},
        authorId:{ type : GraphQLNonNull(GraphQLInt)},
        author : {
            type:AuthorType,
            resolve:(book)=>{
                return authors.find((author)=>book.authorId==author.id)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
  name : "Authors",
  description:"Returns the detauils of the authors",
  fields:()=>({
    id:{type: GraphQLNonNull(GraphQLInt)},
    name:{type: GraphQLNonNull(GraphQLString)},
    book:{
        type:GraphQLList(BookType),
        resolve:(author)=>{
            return books.filter((book)=>book.authorId == author.id)
        }
    }
})  
})

const MainQueryType = new GraphQLObjectType({
    name : "Query",                         //returns the document of the fields that are defined inside the fields
    description: "The Main Query",
    fields: ()=>({  
        book: {
            type: BookType,
            description:"Returns a single book that satisfies the arguments passed in",
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>{
                return books.find(book=> book.id == args.id)
            }
        },
        author:{
            type: AuthorType,
            description:"Returns a single book that satisfies the arguments passed in",
            args:{
                id:{
                    type: GraphQLInt
                }
            },
            resolve:(parent,args)=>{
                return authors.find(author => author.id == args.id)
            }
        },                        //fields returns the values asked for inside them
        books : {                           //books is a document with the defined schema
            type:new GraphQLList(BookType),
            description:"List of All Books",//resolve populates the result by returning the data from the source
            resolve:()=> books              //books is the object above or database in real life scenario
        },
        authors: {
            type : new GraphQLList(AuthorType),
            description:"Returns the list of all authors",
            resolve:()=>authors              //looks for the authors in the database for data
        },
    })
})

const MainMutation = new GraphQLObjectType({
    name:"Mutation",
    description : "Main Mutation",
    fields:()=>({
        addBook: {
            type:BookType,
            description:"Adds a new Book",
            args:{
                name:{type: GraphQLNonNull(GraphQLString)},
                authorId:{type:GraphQLNonNull(GraphQLInt)}
            },
            resolve:(parent,args)=>{
                const book = {
                    id : books.length + 1,
                    name : args.name,
                    authorId : args.authorId 
                }
                books.push(book)
                return book
            }
        }
    })
})

const schema = new GraphQLSchema({
    query : MainQueryType,
    mutation: MainMutation

})

app.use('/graphql',graphqlHTTP({
    graphiql : true,
    schema : schema,

}))


app.listen(5500,()=>console.log("Running in port 5500"));