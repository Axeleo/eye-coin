const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.get(index.html);
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})