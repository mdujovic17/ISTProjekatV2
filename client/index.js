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
                <td>${element.category}</td>
                <td>${element.price}</td>
                <td>${element.text}</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            `
        });
        res.send(getView("index").replace("##TABLEDATA", view));
    }).catch((error) => {
        console.log(error);
    });
});