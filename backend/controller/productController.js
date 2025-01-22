
import Product from '../models/productModel.js';
import { scrapeAmazonProduct } from '../scrapper/index.js';
import { getAveragePrice, getHighestPrice, getLowestPrice } from '../utils.js';
import { generateEmailBody, sendEmail } from '../mail/index.js';

const scrapeAndStoreProduct = async (productUrl) => {
  if (!productUrl) return;

  try {

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;
    console.log(scrapedProduct);

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });
    console.log("ok");

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
      return existingProduct._id;
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );
    console.log("ok");

    return newProduct._id;
  } catch (error) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
};

const getProductById = async (productId) => {
  try {
   

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
};

const getAllProducts = async () => {
  try {


    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
};

const getSimilarProducts = async (productId) => {
  try {
  

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
};

const addUserEmailToProduct = async (productId, userEmail) => {
  try {
    const product = await Product.findById(productId);

    if (!product) return;

    const userExists = product.users.some((user) => user.email === userEmail);

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, 'WELCOME');

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
};

export {
  scrapeAndStoreProduct,
  getProductById,
  getAllProducts,
  getSimilarProducts,
  addUserEmailToProduct,
};
