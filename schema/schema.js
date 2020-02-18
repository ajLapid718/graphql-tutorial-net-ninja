// prepare to set up schema for/with GraphQL;
// define schema here;
// our schema will define the data on the graph --- object types, relationships, instructions on how to query/retrieve/mutate data;
// the three responsibilities of this file are:
// 1) define types;
// 2) define relationships between types;
// 3) define root queries (how we describe to the client entry points to the graph);
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt } = graphql;

// dummy data/mockDB;
const books = [
  { id: "1", name: "Name of the Wind", genre: "Fantasy", authorId: "1" },
  { id: "2", name: "The Final Empire", genre: "Fantasy", authorId: "2"},
  { id: "3", name: "The Long Earth", genre: "Sci-Fi", authorId: "3" }
];

const authors = [
  { id: "1", name: "Patrick Rothfuss", age: 44 },
  { id: "2", name: "Brandon Sanderson", age: 42 },
  { id: "3", name: "Terry Pratchett", age: 66 }
];

// responsibility 1: define types;
// if any of the actual data values of an entity of data goes against the type properties defined here, the client will still get back any data that was queried for and passed the type-checking process, along with an array of errors that, depending on the discrepency between data value and declared type-check, could output something like this: ""message": "Boolean [[my addition to the message: type-check]] cannot represent a non boolean value [[my addition to the message: actual data value from source of data]]: \"1\"","
const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => {
    return {
      id: {
        type: GraphQLID
      },
      name: {
        type: GraphQLString
      },
      genre: {
        type: GraphQLString
      },
      hello: { // POINT 1: You can add a field to BookType that doesn't exist in your original raw data as long as you ultimately include this field in the corresponding resolver function;
      // if a field exists in BookType and is explictly queried for by the client, but for whatever reason is not a part of the object returned by the corresponding resolver function, a null value will appear (with the way we have the code set-up --- it is possible to define types such that they are non-nullable/"required");
        type: GraphQLString
      },
      author: {
        type: AuthorType,
        resolve: (parent, args) => {
          // here, we will write out the logic and operation to grab the author object related to this book object;
          // the book object is a node on our graph and the connection between the book node and the author node is called an edge;
          // aside from that, resolvers are used to return data back;
          // console.log(parent) // { resolved book node here };
          // because we have access to the properties on the parent by this point...
          // ... we can access parent.authorId to grab the related data we currently are targeting;
          // this is similar to eager-loading in that we can grab related data and give it back to the user as an additional property;
          // HOWEVER, this is different from eager-loading as this system approaches that same end-goal, but with lazy-loading instead;
          // this information and this resolver function will only fire off if AND ONLY IF the client specifically queries for it;
          // this is vastly different from eager-loading, which will append the data to each and every response;
          const targetAuthor = authors.find(author => author.id === parent.authorId);
          return targetAuthor;
        }
      }
    }
  }
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => {
    return {
      id: { 
        type: GraphQLID
      },
      name: {
        type: GraphQLString
      },
      age: {
        type: GraphQLInt
      }
    }
  }
})

// responsibility 2: define relationships (if necessary) and responsibility 3: define root query (queries);
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      args: {
        id: {
          type: GraphQLID // this will type-check/validate the data type of the argument passed into the query from the client;
        }
      },
      resolve: (parent, args) => {
        // grab data from either a database or some other source;
        // we have access to args.id here;
        // console.log(typeof args.id); // "string";
        // the data type of args.id here is a string, regardless of how it is inputted (as an integer or as a string) on the client-side;
        // an error will be raised if the argument on the client-side is anything other than an integer or a string;
        // specifying GraphQLID helps with self-documenting code;
        // this resolve function should return an object that is shaped in a legal way such that it will pass all the enforced validations;
        const targetBook = books.find(book => book.id === args.id);
        return {...targetBook, hello: "yeoooo" }; // POINT 1A ---> Append the "hello" field in order to pass all validations enforced by Line 85;
      }
    },
    author: {
      type: AuthorType,
      args: {
        id: {
          type: GraphQLID
        }
      },
      resolve: (parent, args) => {
        const targetAuthor = authors.find(author => author.id === args.id);
        return targetAuthor;
      }
    }
  }
})

/*

SAMPLE QUERY AT THIS POINT;

book (id: "2") {
  name
  genre
}

author (id: "1") {
  name
  age
}

*/

// schema definition: by defining a schema we define the entities that exist, but also the different queries and mutations that are possible to make;

module.exports = new GraphQLSchema({
  query: RootQuery
});