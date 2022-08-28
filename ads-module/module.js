const fs = require("fs")

const PATH = "adverts.json"

let readJSON = () => {

    if (!fs.existsSync(PATH)) {
        fs.writeFileSync(PATH, "[]");
    }

    let ads = fs.readFileSync(PATH, (err, data) => {
        if (err) 
            throw err;
        return data;
    });

    return JSON.parse(ads)
}

let writeJSON = (data) => {
    fs.writeFileSync(PATH, JSON.stringify(data));
}

exports.allAdvertisements = () => {
    return readJSON();
}

exports.addAdvertisement = (newAdvertisement) => {
    let id = 1;
    let ads = this.allAdvertisements();

    if (ads.length > 0) {
        id = ads[ads.length - 1].id + 1;
    }

    newAdvertisement.id = id;
    ads.push(newAdvertisement);

    writeJSON(ads);
}

exports.getAdvertisement = (id) => {
    return this.allAdvertisements().find(x => x.id == id);
}

exports.editAdvertisement = (id, body) => {
    let ads = this.allAdvertisements();
    //let index = ads.find(x => x.id == id)

    console.log(ads[id])
    console.log(body)
     
    for (i = 0; i < ads.length; i++) {
        if (ads[i].id === body.id) {
            ads[i] = body;
        } 
    }

    console.log(ads[id])

    writeJSON(ads);
}

//JSON ne podrzava undefined objekat, tako da se konvertuje u string na klijentskoj strani, neazvisno od ovog projekta.
exports.filter = (priceMin, priceMax, category, keywords, tags) => {
    
    if (priceMin === 'undefined') {
        priceMin = 0;
    }
    if (priceMax === 'undefined') {
        priceMax = 10000000;
    }

    let adverts = this.allAdvertisements().filter(ad => parseFloat(ad.price) >= parseFloat(priceMin) && parseFloat(ad.price) <= parseFloat(priceMax))
    console.log(priceMin, priceMax, category, keywords, tags);
    if (category !== 'undefined') {
        adverts = adverts.filter(ad => ad.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (keywords !== 'undefined') {
        adverts = adverts.filter(ad => ad.text.toLowerCase().includes(keywords.toLowerCase()));
    }
    if (tags !== 'undefined') {
        adverts = adverts.filter(ad => ad.tags.some(tag => tags.includes(tag)));
    }

    //console.log(adverts);
    return adverts;
}

exports.filterByCategory = (category) => {
    return this.allAdvertisements().filter(ad => ad.category.toLowerCase().includes(category.toLowerCase()))
}

exports.getAdByPrice = (price) => {
    return this.allAdvertisements().filter(ad => parseInt(ad.price) >= parseInt(price))
}

exports.filterByPrice = (min, max) => {
    return this.allAdvertisements().filter(ad => parseFloat(ad.price) >= parseFloat(min) && parseFloat(ad.price) <= parseFloat(max))
}

exports.deleteAdvertisement = (id) => {
    writeJSON(this.allAdvertisements().filter(ad => ad.id != id))
}