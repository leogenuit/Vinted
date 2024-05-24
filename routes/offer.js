const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileupload = require("express-fileupload");
const Offer = require("../models/Offer");
const User = require("../models/User");
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middlewares/isAuthenticated");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post(
  "/offer/publish",
  fileupload(),
  isAuthenticated,
  async (req, res) => {
    try {
      let productImage;

      // Destructuring
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
      });
      // si aucun file n'est envoyé
      // if (!req.files) {
      //   return res.json({ message: "file(s) expected" });
      // }

      // Déclaration d'un tableau vide pour lui push des files
      const arrayOfFileUrl = [];

      // Récuperation du la picture passé dans le body
      const pictureToUpload = req.files.picture;

      // Si pictureToUpload est un objet (soit un file files passé dans le corps de la requête)
      if (pictureToUpload.length === undefined) {
        const result = await cloudinary.uploader.upload(
          convertToBase64(pictureToUpload)
        );
        productImage = result;

        // Sinon pictureToUpload est un tableau (soit plusieurs files passé dans le corps la requête)
      } else {
        // Boucle sur mon tableau d'objet
        for (let i = 0; i < pictureToUpload.length; i++) {
          const picture = pictureToUpload[i];
          const result = await cloudinary.uploader.upload(
            convertToBase64(picture)
          );
          console.log(result);
          arrayOfFileUrl.push(result);
          console.log(result);
        }
        productImage = arrayOfFileUrl;
      }

      newOffer.product_image = productImage;
      await newOffer.save();
      res.status(201).json({ message: "yes" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const filter = {};
    const sortFilter = {};
    const limit = 5;

    let pageNumber = 1;
    const { title, priceMin, priceMax, sort, page } = req.query;

    if (title) {
      filter.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filter.product_price = { $gte: priceMin };
    }
    if (priceMax) {
      if (filter.product_price) {
        filter.product_price.$lte = priceMax;
      } else {
        filter.product_price = { $gte: priceMax };
      }
    }

    if (sort === "price-desc") {
      sortFilter.product_price = -1;
    } else if (sort === "price-asc") {
      sortFilter.prodct_price = 1;
    }

    if (page) {
      pageNumber = page;
    }

    const numberToSkip = (pageNumber - 1) * limit;

    const offers = await Offer.find(filter)
      .sort(sortFilter)
      .limit(limit)
      .skip(numberToSkip)
      // .populate("owner", "account");
      .select("product_price product_name -_id");

    res.json(offers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
