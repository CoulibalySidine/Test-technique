require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Joi = require("joi");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/test"; // URI de votre base de données

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connecté"))
  .catch((error) => console.error("Erreur de connexion à MongoDB :", error));

// Models
const Product = mongoose.model("Product", {
  name: String,
  type: String,
  price: Number,
  rating: Number,
  warranty_years: Number,
  available: Boolean,
});

// Validation Schema
const productSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  price: Joi.number().required(),
  rating: Joi.number().min(0).max(5).required(),
  warranty_years: Joi.number().required(),
  available: Joi.boolean().required(),
}).options({ stripUnknown: true }); // Cette option permet de supprimer les champs non validés


// Routes
// GET - Récupérer tous les produits
app.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST - Ajouter un nouveau produit
app.post("/products", async (req, res, next) => {
  try {
    const validatedBody = await productSchema.validateAsync(req.body);
    const productToSave = new Product(validatedBody);
    const product = await productToSave.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// PUT - Mettre à jour un produit existant
app.put('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params; // Récupérer l'ID du produit dans l'URL
    const validatedBody = await productSchema.validateAsync(req.body); // Valider les données envoyées (sans _id)
    
    console.log("Données validées pour mise à jour : ", validatedBody); // Log pour déboguer

    // Mettre à jour le produit dans la base de données
    const product = await Product.findByIdAndUpdate(id, validatedBody, { new: true });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product); // Retourner le produit mis à jour
  } catch (error) {
    console.error('Erreur de mise à jour:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour' });
  }
});


// DELETE - Supprimer un produit
app.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.status(204).send(); // 204 No Content pour indiquer que la suppression a réussi
  } catch (error) {
    next(error);
  }
});

// Middleware d'erreur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
