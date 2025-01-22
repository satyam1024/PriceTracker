import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeAndStoreProduct, getProductById, getAllProducts, getSimilarProducts, addUserEmailToProduct } from '../backend/controller/productController.js';

dotenv.config();

let isConnected = false;

const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) return console.log('MONGODB_URL is not defined');

  if (isConnected) return console.log('=> using existing database connection');

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.log(error);
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 5000;

// Connect to DB
connectToDB();

// Routes
app.post('/scrape', async (req, res) => {
  const { productUrl } = req.body;
  try {
    const pID=await scrapeAndStoreProduct(productUrl);
    if (pID) {
        res.status(200).json(pID);
      } 
      else{
    res.status(200).send("Product scraped and stored successfully");
      }
  } catch (error) {
    res.status(500).send("Failed to scrape and store product");
  }
});

app.get('/products/:id', async (req, res) => {
    console.log("in");
  const { id } = req.params;
  try {
    const product = await getProductById(id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    res.status(500).send("Error retrieving product");
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send("Error retrieving products");
  }
});

app.get('/similar-products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const similarProducts = await getSimilarProducts(id);
    if (similarProducts) {
      res.status(200).json(similarProducts);
    } else {
      res.status(404).send("Similar products not found");
    }
  } catch (error) {
    res.status(500).send("Error retrieving similar products");
  }
});

app.post('/add-user-email', async (req, res) => {
  const { productId, userEmail } = req.body;
  try {
    await addUserEmailToProduct(productId, userEmail);
    res.status(200).send("User email added successfully");
  } catch (error) {
    res.status(500).send("Failed to add user email");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
