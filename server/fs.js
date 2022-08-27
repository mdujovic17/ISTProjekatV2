const fs = require("fs");
const PATH = "/data/advertisements.json";

let read = () => {
    if (!fs.existsSync(PATH)) {
        fs.writeFileSync(PATH, "[]");
    }

    let ads = fs.readFileSync(PATH, (err, data) => {
        if (err) {
            throw err;
        }
        return data;
    });

    return JSON.parse(ads);
}

let write = (data) => {
    fs.writeFileSync(PATH, JSON.stringify(data));
}

exports.allAdvertisemnets = () => {
    return read();
}

exports.getAdvertisement = (id) => {
    return this.allAdvertisements().find(x => x.id == id);
}

exports.addAdvertisement = (advertisement) => {
    let id = 1;
    let ads = this.allAdvertisemnets();

    if (ads.length > 0) {
        id = ads[ads.length - 1].id + 1;
    }

    advertisement.id = id;
    ads.push(advertisement);

    write(ads)
}

exports.editAdvertisement = (id, body) => {
    let ads = this.allAdvertisements();
    let index = ads.find(x => x.id == id)

    ads[index] = body
    writeJSON(ads)
}

exports.getAdByCategory = (category) => {
    return this.allAdvertisements().filter(ad => ad.category.toLowerCase().includes(category.toLowerCase()))
}

exports.getAdByPrice = (price) => {
    return this.allAdvertisements().filter(ad => parseInt(ad.price) >= parseInt(price))
}

exports.deleteAdvertisement = (id) => {
    writeJSON(this.allAdvertisements().filter(ad => ad.id != id))
}