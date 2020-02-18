// prepare to set up schema for/with GraphQL;
// define schema here;
// our schema will define the data on the graph --- object types, relationships, instructions on how to query/retrieve/mutate data;
// the three responsibilities of this file are:
// 1) define types;
// 2) define relationships between types;
// 3) define root queries (how we describe to the client entry points to the graph);
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql;

// dummy data/mockDB;
const books = [
  { id: 1, name: "Name of the Wind", genre: "Fantasy"},
  { id: 2, name: "The Final Empire", genre: "Fantasy"},
  { id: 3, name: "The Long Earth", genre: "Sci-Fi"}
];

// responsibility 1: define types;
const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => {
    return {
      id: { 
        type: GraphQLString 
      },
      name: {
        type: GraphQLString
      },
      genre: {
        type: GraphQLString
      }
    }
  }
});

// responsibility 2: define relationships (TBA);

// responsibility 3: define root query (queries);
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: BookType,
    args: {
      id: {
        type: GraphQLString
      }
    },
    resolve(parent, args) {
      // code to get data from database/other source;
      // we have access to args.id here;
      // TBD;
    }
  }
})

/*

SAMPLE QUERY AT THIS POINT;

book (id: "123") {
  name
  genre
}

*/

// schema definition: by defining a schema we define the entities that exist, but also the different queries and mutations that are possible to make;

module.exports = new GraphQLSchema({
  query: RootQuery
});