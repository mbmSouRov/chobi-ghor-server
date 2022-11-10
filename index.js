const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.send(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("chobiGhor").collection("services");
    const reviewsCollection = client.db("chobiGhor").collection("reviews");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "300h",
      });
      res.send({ token });
    });

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
      const sort = { _id: -1 };
      const cursos = serviceCollection.find(query).sort(sort);
      const services = await cursos.toArray();
      res.send(services);
    });

    //ALL REVIEW
    app.get("/allReview", async (req, res) => {
      const query = {};
      const cursos = reviewsCollection.find(query);
      const services = await cursos.toArray();
      res.send(services);
    });

    //Find A Single Service
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //Find A Single Review
    app.get("/allReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await reviewsCollection.findOne(query);
      res.send(service);
    });

    //reviews add
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    //service add
    app.post("/service", async (req, res) => {
      const review = req.body;
      const result = await serviceCollection.insertOne(review);
      res.send(result);
    });

    //For each service, reviews extract
    app.get("/allReviews", async (req, res) => {
      let query = {};
      if (req.query.service) {
        query = {
          service: req.query.service,
        };
      }
      const cursor = reviewsCollection.find(query);
      const allReviews = await cursor.toArray();
      res.send(allReviews);
    });

    //For each user, reviews extract
    app.get("/userReviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      // console.log("inside order api", decoded);

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewsCollection.find(query);
      const allReviews = await cursor.toArray();
      res.send(allReviews);
    });

    //Update a user review
    app.patch("/allReview/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.textArea;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          textArea: status,
        },
      };
      const result = await reviewsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //DELETE a users review comment
    app.delete("/allReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
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
