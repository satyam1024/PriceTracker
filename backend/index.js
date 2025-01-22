import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeAndStoreProduct, getProductById, getAllProducts, getSimilarProducts, addUserEmailToProduct } from '../backend/controller/productController.js';
import cron from 'node-cron';
import Product from './models/productModel.js';
import { scrapeAmazonProduct } from './scrapper/index.js';
import { getAveragePrice, getHighestPrice, getLowestPrice, getEmailNotifType } from './utils.js';
import { generateEmailBody, sendEmail } from './mail/index.js';

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

connectToDB();
const app = express();

// Middleware
app.use(cors());
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 5000;


app.get('/home', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
})

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



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});









cron.schedule("0 0 * * *", async () => { 
  console.log("Running cron job to scrape products and update database...");
  
  try {
   
    const products = await Product.find({});
    if (!products) throw new Error("No product fetched");

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
        if (!scrapedProduct) return null;

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update product in the database
        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { new: true } 
        );

        const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);
        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          const userEmails = updatedProduct.users.map((user) => user.email);
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error(`Failed to complete cron job: ${error.message}`);
  }
});

module.exports = app
