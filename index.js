const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

const schema = require("./schema/schema");

var root = { hello: () => "Hello world!" };

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: process.env.NODE_ENV === "development",
  })
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
