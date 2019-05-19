const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.get(index.html);
});

var server = app.listen(8081, function () {
   console.log("Eye Coin now running at localhost:8081")
})