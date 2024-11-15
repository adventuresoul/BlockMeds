const express = require('express');

const app = express();

// connect to MongoDB
const connectToMongoDB = require('./models/db_configuration');
connectToMongoDB();


app.get('/', async (req, res) => {
    res.status(200).send("Hello");
})


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});