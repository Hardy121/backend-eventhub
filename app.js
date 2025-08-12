const express = require("express");
const app = express();
const userRouter = require('./src/routes/user.router');
const eventRouter = require('./src/routes/event.router');
const { connectDb } = require("./src/config/connectDb");
const cors = require('cors');
const PORT = 3003
require('dotenv').config()


app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send("Hello, eventhub server is running...")
})

app.use('/api/v1/user', userRouter);
app.use('/api/v1/event', eventRouter);

(async () => {
    await connectDb();
    app.listen(PORT, () => console.log("🚀 Server running"));
})();