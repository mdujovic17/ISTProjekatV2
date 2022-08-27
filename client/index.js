const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const axios = require("axios");
const PORT = 5001;
const SERVER_PORT = 3001;

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Gets HTML View from a specified directory.
let getView = (view) => {
    return fs.readFileSync(path.join(`${__dirname}/view/${view}.html`), "utf-8");
};

app.get("/", (req, res) => {

    let options = {
        method: 'GET',
        url: `http://localhost:${SERVER_PORT}/allAdvertisements`
    };

    axios.request(options).then((response) => {
        let view = '';
        response.data.forEach(element => {
        view += 
            `<tr>
                <th scope="row">${element.id}</th>
                <td>${element.category}</td>
                <td>${element.price} ${element.currency}</td>
                <td>${element.date}</td>
                <td scope="col" colspan="2">${element.text}</td>
            
                <td><a class="text-info" href="/details/${element.id}"><i class="fa fa-circle-info"></i></a></td>
                <td><a class="text-warning" href="/edit/${element.id}"><i class="fa fa-pen"></i></a></td>
                <td><a class="text-danger" href="/delete/${element.id}"><i class="fa fa-trash"></i></a></td>
            </tr>`;
        });
        res.send(getView("index").replace("##TABLEDATA", view));
    }).catch((error) => { console.log(error); });
});

app.get("/details/:id", (req, res) => {
    let options = {
        method: "GET",
        url: `http://localhost:${SERVER_PORT}/get/${req.params["id"]}`
    };

    axios.request(options).then(response => {
        let tags = response.data.tags;
        let emails = response.data.emails;

        let emailGroup = "";
        let tagGroup = "";
        
        for (tag of tags) {
            tagGroup += `<span class="badge bg-success"> ${tag} </span>`
        }

        for (email of emails) {
            if (email["type"] === "public")
                emailGroup += `${email["email"]} <span class="badge bg-success"> ${email["type"]} </span><br>`
            else if (email["type"] === "private")
                emailGroup += `${email["email"]} <span class="badge bg-warning"> ${email["type"]} </span><br>`
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
            <td>Mejlovi</td>
            <td>${emailGroup}</td> 
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

    console.log(req.body);

    let emails = [];

    emails.push({email: req.body[`email`], type: req.body.radioMail})

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
});

app.get("/edit/:id", (req, res) => {
    let options = {
        method: "GET",
        url: `http://localhost:${SERVER_PORT}/edit/${req.params["id"]}`
    }

    axios.request(options).then((response) => {

        console.log(response.data);

        let view = getView("edit");
        
        let tags = response.data.tags;
        let emails = response.data.emails;
        let tagGroup = tags.join(",");

        console.log(tagGroup);

        let currency = response.data.currency;
        let category = response.data.category;
        let categories = {"automobili": "##AUTO", "alat": "##ALAT", "komponente": "##COMP", "rezervni-delovi": "##DELO", "ostalo": "##ETC"};

        for ([key, value] of Object.entries(categories)) {
            if (key === category) {
                view = view.replace(value, "selected");
            }
            else {
                view = view.replace(value, "");
            }
        }

        console.log(currency);

        if (currency === "RSD") {
            view = view.replace("##{rsd}", "selected");
            view = view.replace("##{eur}", "");
            view = view.replace("##{usd}", "");
        }
        else if (currency === "EUR") {
            view = view.replace("##{rsd}", "");
            view = view.replace("##{eur}", "selected");
            view = view.replace("##{usd}", "");
        }
        else if (currency === "USD") {
            view = view.replace("##{rsd}", "");
            view = view.replace("##{eur}", "");
            view = view.replace("##{usd}", "selected");
        }

        view = view.replace("##ID", parseInt(response.data.id));
        view = view.replace("##DATE", response.data.date);
        view = view.replace("##PRICE", parseFloat(response.data.price));
        view = view.replace("##{tags}", tagGroup);
        view = view.replace("##TEXT", response.data.text);
        view = view.replace("##EMAIL", emails[0]["email"]);

        if (emails[0]["type"] === "public") {
            view = view.replace("##PUBLIC", "checked");
            view = view.replace("##PRIVATE", "");
        }
        else if (emails[0]["type"] === "private") {
            view = view.replace("##PUBLIC", "");
            view = view.replace("##PRIVATE", "checked");
        }

        if (emails.length > 1) {
            let counter = 0;
            let emailList = "";
            for (i = 1; i < emails.length; i++) {
                let type = emails[i]["type"];
                let private, public = "";

                if (type === "private") {
                    private = "checked";
                    public = "";
                }
                    
                if (type === "public") {
                    private = "";
                    public = "checked";
                }
                emailList += 
                `
                <div id="new-mail-${i}" name="new-mail-${i}">
                <div class="form-floating mb-3">
                    <input type="email" class="form-control" name='email-${i}' id="email-${i}" value="${emails[i]["email"]}" required>
                    <label for="email-${i}">Email adresa</label>
                </div>
                <div class="container row mb-3">
                    <div class="form-check col">
                        <input class="form-check-input" type="radio" name='radioMail-${i}' id="radioPublic-${i}" value="public" ${public}>
                        <label class="form-check-label" for="radioPublic-${i}">
                            Sluzbeni email
                        </label>
                    </div>
                    <div class="form-check col">
                        <input class="form-check-input" type="radio" name='radioMail-${i}' id="radioPrivate-${i}" value="private" ${private}>
                        <label class="form-check-label" for="radioPrivate-${i}">
                            Privatni email
                        </label>
                    </div>
                </div>
                <div class="container mb-3">
                    <button type="button" class="btn btn-secondary btn-lg w-100" onclick="removeNewMail(${i})">Ukloni</button>
                </div>
            </div>
                `
                counter++;
            }
            view = view.replace("##EMAILS", emailList);
            view = view.replace("##COUNTER", counter);
        }
        else {
            view = view.replace("##EMAILS", "");
            view = view.replace("##COUNTER", 0);
        }
        res.send(view);
    });
});

app.post("/edit", (req, res) => {

    let emails = [];

    emails.push({email: req.body[`email`], type: req.body.radioMail})

    for (let i = 0; i < req.body.counter; i++) {
        emails.push( {email: req.body[`email-${i}`], type: req.body[`radioMail-${i}`]} );
    }

    let price = parseFloat(req.body.price);
    let id = parseInt(req.body.id);

    let options = {
        method: 'POST',
        url: `http://localhost:${SERVER_PORT}/edit/${req.body.id}`,
        data: {
            category: req.body.category,
            date: req.body.date,
            price: price * 1,
            currency: req.body.currency,
            text: req.body.text,
            tags: req.body.tags.split(','),
            emails: emails,
            id: id * 1
        }
    };

    console.log(options.data);

    axios.request(options).then(response => {
        console.log(response.data)
    })

    res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
    axios.delete(`http://localhost:${SERVER_PORT}/delete/${req.params["id"]}`)
    res.redirect("/");
});

app.listen(PORT, () => { console.log(`Client started on port ${PORT}`); });