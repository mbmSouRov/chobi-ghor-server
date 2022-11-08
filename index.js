const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//Middle Wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jc72o0s.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("chobiGhor").collection("services");

    //ONLY 3 SERVICES
    app.get("/services", async (req, res) => {
      const query = {};
      const cursos = serviceCollection.find(query);
      const services = await cursos.limit(3).toArray();
      res.send(services);
    });

    //ALL SERVICE
    app.get("/allServices", async (req, res) => {
      const query = {};
      const cursos = serviceCollection.find(query);
      const services = await cursos.toArray();
      res.send(services);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

// .
// .
// .
// .
// ============================
app.get("/", (req, res) => {
  res.send("Chobi Ghor server is loading");
});

app.listen(port, () => {
  console.log("Server is running on port:", port);
});
