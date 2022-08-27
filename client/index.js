const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;
const SERVER_PORT = 3000;

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Gets HTML View from a specified directory.
let getView = (view) => {
    return fs.readFileSync(path.join(`${__dirname}/view/${view}.html`), "utf-8");
};

app.get("/", (req, res) => {

    let options = {
        method: "GET",
        url: `http://localhost:${SERVER_PORT}/`
    };

    axios.request(options).then((response) => {
        let view = "";
        response.data.forEach(element => {
            view += 
            `
            <tr>
                <th scope="row">${element.id}</th>
                <td>${element.category}</td>
                <td>${element.price} ${element.currency}</td>
                <td>${element.date}</td>
                <td scope="col" colspan="2">${element.text}</td>
                
                <td><a class="text-info" href="/details/${element.id}"><i class="fa fa-circle-info"></i></a></td>
                <td><a class="text-warning" href="/edit/${element.id}"><i class="fa fa-pen"></i></a></td>
                <td><a class="text-danger" href="/delete/${element.id}"><i class="fa fa-trash"></i></a></td>
            </tr>
            `;
        });
        res.send(getView("index").replace("##TABLEDATA", view));
    }).catch((error) => {
        console.log(error);
    });
});

app.get("/details/:id", (req, res) => {
    let options = {
        method: "GET",
        url: `http://localhost:${SERVER_PORT}/getAdvertisement/${req.params["id"]}`
    };

    axios.request(options).then(response => {
        let tags = response.data.tags
        let tagGroup = ""
        
        for (tag in tags) {
            tagGroup += `<span class="badge bg-success">${tag}</span>`
        }

        let view = "";
        view +=
        `
        <tr>
            <td>ID</td>
            <td>${response.data.id}</td> 
        </tr>
        <tr>
            <td>Kategorija</td>
            <td>${response.data.category}</td> 
        </tr>
        <tr>
            <td>Cena</td>
            <td>${response.data.price}</td> 
        </tr>
        <tr>
            <td>Valuta</td>
            <td>${response.data.currency}</td> 
        </tr>
        <tr>
            <td>Datum</td>
            <td>${response.data.date}</td> 
        </tr>
        <tr>
            <td>Opis</td>
            <td>${response.data.text}</td> 
        </tr>
        <tr>
            <td>Opis</td>
            <td>${response.data.emails}</td> 
        </tr>
        <tr>
            <td>Tagovi</td>
            <td>${tagGroup}</td> 
        </tr>
        `;
        res.send(getView("details").replace("##TABLEDATA", view));
    }).catch((error) => {
        console.log(error);
    });
});

app.get("/add", (req, res) => {
    res.send(getView("add"));
});

app.post("/add", (req, res) => {

    let emails = [];

    emails.push({email: req.body[`email`], type: req.body[`radioMail`]})

    for (let i = 0; i < req.body.counter; i++) {
        emails.push( {email: req.body[`email-${i}`], type: req.body[`radioMail-${i}`]} );
    }

    let options = {
        method: 'POST',
        url: `http://localhost:${SERVER_PORT}/add`,
        data: {
            category: req.body.category,
            date: req.body.date,
            price: req.body.price,
            currency: req.body.currency,
            text: req.body.text,
            tags: req.body.tags.split(','),
            emails: emails
        }
    };

    axios.request(options).then(response => {
        console.log(response.data)
    })

    res.redirect("/");
})