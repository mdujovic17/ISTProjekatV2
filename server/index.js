const express = require("express");
const adsModule = require("ads-module");
const { response } = require("express");
const app = express();
const port = 3001;

app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.get('/allAdvertisements',(request, response)=>{ response.send(adsModule.allAdvertisements()) });

app.get('/get/:id',(request, response)=>{ response.send(adsModule.getAdvertisement(request.params["id"])) });

app.post('/add',(request,response)=>{
    adsModule.addAdvertisement(request.body);
    response.end("OK");
})

app.delete('/delete/:id',(request,response)=>{
    adsModule.deleteAdvertisement(request.params["id"]);
    response.end("OK");
})

app.get('/edit/:id',(request,response)=>{ response.send(adsModule.getAdvertisement(request.params["id"])); })

app.post('/edit/:id',(request,response)=>{
    console.log(request.body);
    adsModule.editAdvertisement(request.params["id"],request.body);
    response.end("OK");
})

app.get('/filter', (request, response) => {
    console.log(request.query);
    console.log(request.query["priceMin"], request.query["priceMax"], request.query["category"], request.query["keywords"], request.query["tags"]);
    response.send(adsModule.filter(request.query["priceMin"], request.query["priceMax"], request.query["category"], request.query["keywords"], request.query["tags"]));
})

// app.get('/filter/:priceMin?&:priceMax?&:category',(request,response)=>{
//     response.send(adsModule.getAdByCategory(request.query["category"]));
// })

// app.get('/filterByPrice/',(request,response)=>{
//     response.send(adsModule.getAdByPrice(request.query.min, request.query.max))
// })

app.listen(port,()=>{console.log(`Server start on port ${port}`)});