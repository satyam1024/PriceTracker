"use server";

import axios from 'axios';

export async function scrapeAmazonProduct(url) {
  if (!url) return;

  const apiKey = String(process.env.SCRAPPER_API);

  const options = {
    method: 'GET',
    url: 'https://scrapers-proxy2.p.rapidapi.com/parser',
    params: {
      url: url,
      auto_detect: 'true',
    },
    headers: {
      'x-rapidapi-key': String(apiKey),
      'x-rapidapi-host': 'scrapers-proxy2.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    console.log(data);

    const title = data.name; // Product Title
    const price = data.price; // Current Price
    const originalPrice = data.originalPrice; // Original Price
    const currency = data.currency; // Currency
    const mainImage = data.mainImage; // Main Image URL
    const description = data.description; // Product Description
    const inStock = data.inStock;
    const discountRate = ((parseInt(originalPrice) - parseInt(price)) / parseInt(originalPrice)) * 100;

    const result = {
      url,
      currency: currency || '$',
      image: mainImage[0],
      title: title,
      currentPrice: parseInt(price) || parseInt(originalPrice),
      originalPrice: parseInt(originalPrice) || parseInt(price),
      priceHistory: [],
      discountRate: discountRate,
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: inStock,
      description: description,
      lowestPrice: parseInt(price) || parseInt(originalPrice),
      highestPrice: parseInt(originalPrice) || parseInt(price),
      averagePrice: parseInt(price) || parseInt(originalPrice),
    };

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
}
