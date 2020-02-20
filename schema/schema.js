// prepare to set up schema for/with GraphQL;
// define schema here;
// our schema will define the data on the graph --- object types, relationships, instructions on how to query/retrieve/mutate data;
// the three responsibilities of this file are:
// 1) define types;
// 2) define relationships between types;
// 3) define root queries (how we describe to the client entry points to the graph);
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList } = graphql;

const Author = require("../models/author");
const Book = require("../models/book");

// dummy data/mockDB;
// const books = [
//   { id: "1", name: "Name of the Wind", genre: "Fantasy", authorId: "1" },
//   { id: "2", name: "The Final Empire", genre: "Fantasy", authorId: "2"},
//   { id: "3", name: "The Long Earth", genre: "Sci-Fi", authorId: "3" },
//   { id: "4", name: "The Hero of Ages", genre: "Fantasy", authorId: "2" },
//   { id: "5", name: "The Colour of Magic", genre: "Fantasy", authorId: "3" },
//   { id: "6", name: "The Light Fantastic", genre: "Fantasy", authorId: "2" }
// ];

// const authors = [
//   { id: "1", name: "Patrick Rothfuss", age: 44 },
//   { id: "2", name: "Brandon Sanderson", age: 42 },
//   { id: "3", name: "Terry Pratchett", age: 66 }
// ];

// responsibility 1: define types; if any of the actual data values of an entity
// of data goes against the type properties defined here, the client will still
// get back any data that was queried for and passed the type-checking process,
// along with an array of errors that, depending on the discrepency between data
// value and declared type-check, could output something like this: ""message":
// "Boolean [[my addition to the message: type-check]] cannot represent a non
// boolean value [[my addition to the message: actual data value from source of
// data]]: \"1\"","
const BookType = new GraphQLObjectType({
  name: "Book",
  // FIELDS: THE CLIENT CAN ONLY QUERY FOR WHAT IS DEFINED IN FIELDS 
  // NO MORE, NO LESS (?);
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
      
      /*

      A: IT IS PERFECTLY LEGAL TO NOT HAVE A 1:1/IDENTICAL MAPPING BETWEEN THE
      FIELDS (WE AREN'T ASKING FOR OR VALIDATING AN AUTHORID HERE BUT IT EXISTS
      IN THE INDIVIDUAL INSTANCES IN THE DUMMY DATA) IN THE RAW MOCK DATA AND
      THE GRAPHQLOBJECTTYPE ---> This is the case because what is exactly
      contained in the raw mock data is not what we'll be using to composing our
      "graph" API ---> Put another way, the client cannot query for something
      that they are not exposed to ---> The validations will be enforced upon
      completion of resolver function (return value of resolver), not before or
      after (?);

      B: THE FIELD BELOW TITLED "AUTHOR" DOESN'T EXIST ON THE RAW MOCK DATA
      ABOVE, BUT WE CAN STILL NEST THIS INFORMATION ON ANY QUERIES FOR A BOOK
      NODE ---> Remember, we do not need to enforce validations to account for
      each and every field in the raw mock data ---> We are not bound to or
      bound by the particular fields in the raw mock data as our main priority
      is to enforce validations on whatever is returned by the resolver
      function;

      */

      author: { // HEY: This is the name of one of the fields in the JSON object that will be returned as a response to the client; 
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
          // this is vastly different from eager-loading, which will append the
          // data to each and every response;
          // console.log("parent???", parent) // NB: CLARIFICATION ----------->
          // parent === the object returned by resolver function to get book node above;
          
          // const targetAuthor = authors.find(author => author.id === parent.authorId);
          // return targetAuthor;

          let foundAuthor = Author.findById({_id: parent.authorId});
          return foundAuthor;
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
      },
      books: {
        type: BooksType,
        resolve: (parent, args) => {
          // const targetBooks = books.filter(book => book.authorId === parent.id);
          // return targetBooks;
          let foundBooks = Book.find({authorId: parent.id});
          return foundBooks;
        }
      }
    }
  }
})

const BooksType = new GraphQLList(BookType);
const AuthorsType = new GraphQLList(AuthorType);

// responsibility 2: define relationships (if necessary) and responsibility 3: define root query (queries);
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType", // this is the name that will appear in either GraphiQL or GraphQL Playground in the introspective self-documentation;
  description: "This is a description", // this is the description that will appear in either GraphiQL or GraphQL Playground in the introspective self-documentation;
  fields: {
    getBook: { // this is a possible convention for query names (C[R]UD) in GraphQL; this is the closest thing to a RESTful endpoint;
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
        // this resolve function should return an object that is shaped in a
        // legal way such that it will pass all the enforced validations;
        // if this resolver function is called in another place, the node
        // returned from this resolver function will be the parent argument
        // passed into the nested/subsequent child resolver function;
        // const targetBook = books.find(book => book.id === args.id);
        // return targetBook;
        let foundBook = Book.findById({_id: args.id});
        return foundBook;
      }
    },
    getBooks: {
      type: BooksType,
      resolve: (parent, args) => {
        // return books;
        let foundBooks = Book.find();
        return foundBooks;
      }
    },
    getAuthor: {
      type: AuthorType,
      args: {
        id: {
          type: GraphQLID
        }
      },
      resolve: (parent, args) => {
        // const targetAuthor = authors.find(author => author.id === args.id);
        // return targetAuthor;
        let foundAuthor = Author.findById({_id: args.id});
        return foundAuthor;
      }
    },
    getAuthors: {
      type: AuthorsType, // if "type" field is omitted, this will raise an error --> this is mandatory;
      resolve: (parent, args) => {
        // return authors;
        let foundAuthors = Author.find();
        return foundAuthors;
      }
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: "MutationType",
  description: "This is a description...",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: {
          type: GraphQLString
        },
        age: {
          type: GraphQLInt
        }
      },
      resolve: async (parent, args) => {
        try {
          let author = new Author({name: args.name, age: args.age});
          let savedAuthor = await author.save();
          return savedAuthor;
        }
        catch (err) {
          return err;
        }
      }
    },
    addBook: {
      type: BookType,
      args: {
        name: {
          type: GraphQLString
        },
        genre: {
          type: GraphQLString
        },
        authorId: {
          type: GraphQLID
        }
      },
      resolve: async (parent, args) => {
        try {
          let book = new Book({name: args.name, genre: args.genre, authorId: args.authorId});
          let savedBook = await book.save();
          return savedBook;
        }
        catch (err) {
          return err;
        }
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
  query: RootQuery,
  mutation: Mutation
});

/* 

SOME RELEVANT (?) CODE FROM THE SOURCE CODE TO HELP EXPLAIN WHY/WHEN THE
VALUE OF FIELDS SHOULD DIRECTLY BE AN OBJECT OR SHOULD BE A FUNCTION THAT
RETURNS AN OBJECT; 

*/

/** 
 * Object Type Definition
 *
 * Almost all of the GraphQL types you define will be object types. Object types
 * have a name, but most importantly describe their fields.
 *
 * Example:
 *
 *     const AddressType = new GraphQLObjectType({
 *       name: 'Address',
 *       fields: {
 *         street: { type: GraphQLString },
 *         number: { type: GraphQLInt },
 *         formatted: {
 *           type: GraphQLString,
 *           resolve(obj) {
 *             return obj.number + ' ' + obj.street
 *           }
 *         }
 *       }
 *     });
 *
 * When two types need to refer to each other, or a type needs to refer to
 * itself in a field, you can use a function expression (aka a closure or a
 * thunk) to supply the fields lazily.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         name: { type: GraphQLString },
 *         bestFriend: { type: PersonType },
 *       })
 *     });
 *
 */

 /*

 /*
 * Used while defining GraphQL types to allow for circular references in
 * otherwise immutable type definitions.
export type Thunk<+T> = (() => T) | T;

function resolveThunk<+T>(thunk: Thunk<T>): T {
  // $FlowFixMe(>=0.90.0)
  return typeof thunk === 'function' ? thunk() : thunk;
}

AND

  getFields(): GraphQLFieldMap<any, any> {
    if (typeof this._fields === 'function') {
      this._fields = this._fields();
    }
    return this._fields;
  }

*/

// look into circular references, backreferences, nested/circular/infinite...
// ...queries on client-side, how dataloader might handle that, how we might
// protect against malicious queries;