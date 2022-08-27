const { request, response } = require("express");
const express = require("express");
let fs = require("./fs")
const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended:false}))
app.use(express.json)

//List all advertisements
app.get("/advertisements", (request, response) => {
    response.send(fs.allAdvertisemnets());
});

//Get Advertisement with a specified ID
app.get("/get/:id", (request, response) => {
    response.send(fs.getAdvertisement(request.params["id"]))
});

//Filter ads by price or category
app.get("/filter/:param", (request, response) => {
    if (request.params["param"].valueOf() === "price") {
        response.send(fs.getAdByPrice(request.query["price"]))
    } 
    else if (request.params["param"].valueOf() === "category") {
        response.send(fs.getAdByPrice(request.query["category"]))
    }
})

//Listens for server start and logs the server port
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});