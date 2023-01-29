const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration
require("dotenv").config();


const { v4: uuidv4 } = require('uuid');

const jwt = require("jsonwebtoken");

// verify jwt token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "UnAuthorized access" });
    }
    const token = authHeader.split(" ")[1];
    console.log("token", token);
    console.log("authHeader", authHeader);
    jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });
        }
        req.decoded = decoded;
        next();
    });
}

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tllgu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("power_hack");
    const billingCollection = database.collection("billing-list");
    const usersCollection = database.collection("users");
    const loginCollection = database.collection("login");
    const registerCollection = database.collection("registration");

    // GET billing API
    app.get("/billing-list", async (req, res) => {
      const cursor = billingCollection.find({});
      const billing = await cursor.toArray();
      res.header('Access-Control-Allow-Origin', '*');
      res.send(billing);
    });
    // GET SINGLE billing API
    app.get("/billing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const bill = await billingCollection.findOne(query);
      res.header('Access-Control-Allow-Origin', '*');
      res.json(bill);
    });

    // ADD a new bill
    app.post("/add-billing", async (req, res) => {
      const bill = req.body;
      const result = await billingCollection.insertOne(bill);
      res.header('Access-Control-Allow-Origin', '*');
      res.send(result);
    });

    // UPDATE A BILL
    app.put("/update-billing/:id", async (req, res) => {
      const id = req.params.id;
      console.log("updating bill", id);
      const updatedBill = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          billingId: updatedBill?.billingId,
          name: updatedBill?.name,
          email: updatedBill?.email,
          phone: updatedBill?.phone,
          amount: updatedBill?.amount,
        },
      };
      const result = await billingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // DELETE API FOR A PRODUCT
    app.delete("/delete-billing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billingCollection.deleteOne(query);
      res.json(result);
    });

    // Login endpoint
    app.post("/login", async (req, res) => {
      const { username, password } = req.body;

      // Find user in the database
      const user = usersCollection?.find((u) => u.username === username);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Username or password is incorrect" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Username or password is incorrect" });
      }
      res.json({ message: "Login successful", userId: user.id });
    });


        // GET PRODUCTS API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.header('Access-Control-Allow-Origin', '*');
            res.send(products);
        })
        // GET SINGLE PRODUCT API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.header('Access-Control-Allow-Origin', '*');
            res.json(product);
        })

        // ADD PRODUCT
        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.header('Access-Control-Allow-Origin', '*');
            res.send(result);
        });

        // UPDATE A PRODUCT
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('updating product', id);
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedProduct.name,
                    category: updatedProduct.category,
                    price: updatedProduct.price,
                    status: updatedProduct.status,
                    time: updatedProduct.time
                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.header('Access-Control-Allow-Origin', '*');
            res.json(result);
        });

        // DELETE API FOR A PRODUCT
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.header('Access-Control-Allow-Origin', '*');
            res.json(result);
        })
        // DELETE API FOR ALL PRODUCTS
        app.delete('/products', async (req, res) => {
            const result = await productsCollection.deleteMany({});
            res.header('Access-Control-Allow-Origin', '*');
            res.json(result);
        })

        // GET USERS API
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.header('Access-Control-Allow-Origin', '*');
            res.send(users);
        })

        // ADD USERS or SAVE USER
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.header('Access-Control-Allow-Origin', '*');
            res.send(result);
        });


    // GET LOGIN API
    app.get("/login", async (req, res) => {
      const cursor = loginCollection.find({});
      const users = await cursor.toArray();
      res.header('Access-Control-Allow-Origin', '*');
      res.send(users);
    });
    // GET REGISTRATION API
    app.get("/registration", async (req, res) => {
      const cursor = registerCollection.find({});
      const users = await cursor.toArray();
      res.header('Access-Control-Allow-Origin', '*');
      res.send(users);
    });
    // GET USERS API
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.header('Access-Control-Allow-Origin', '*');
      res.send(users);
    });

    // ADD USERS or SAVE USER
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.header('Access-Control-Allow-Origin', '*');
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("POWER HACK Server is running");
});

app.listen(port, () => {
  console.log("POWER HACK Server is running on the port :", port);
});
