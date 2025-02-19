const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const port = process.env.port || 4000;

// middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const messageData = "";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjbgh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  const database = client.db("blood_donation");
  const bloodReq_postCollection = database.collection("bloodReq_post");
  const chatCollection = database.collection("chit_chat");

  try {
    await client.connect();

    app.post("/post", async (req, res) => {
      const data = req.body;
      const result = await bloodReq_postCollection.insertOne(data);
      res.json(result);
    });

    app.get("/post", async (req, res) => {
      const query = await bloodReq_postCollection.find({}).toArray();
      res.send(query);
    });

    // chats inserting
    app.post("/chat", async (req, res) => {
      console.log(req.body);
      // const query = await chatCollection.insertOne(data);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welocome to server");
});

// socket io for chat
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data);
    // console.log(`${socket.id} room is ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("received_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });
});

// server listening
server.listen(port, () => {
  console.log("Server is running on ", port);
});
