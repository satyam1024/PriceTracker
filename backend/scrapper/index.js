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
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'scrapers-proxy2.p.rapidapi.com',
    },
  };
  
  try {
    const response = await axios.request(options);
    const data = response.data;
    const title = data.name; // Product Title
    const price = parseFloat(data.price.replace(/[^\d.]/g, '')); 
    const originalPrice = parseFloat(data.originalPrice.replace(/[^\d.]/g, '')); // Original Price
    const currency = data.currency; // Currency
    const mainImage = data.mainImage; // Main Image URL
    const description = data.description; // Product Description
    const inStock = data.inStock;
    const discountRate = (((originalPrice) - (price)) / (originalPrice)) * 100;

    console.log(discountRate,price,originalPrice);
    const result = {
      url,
      currency: currency || '$',
      image: mainImage,
      title: title,
      currentPrice: price ,
      originalPrice: originalPrice,
      priceHistory: [],
      discountRate: discountRate,
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: inStock,
      description: description,
      lowestPrice: price,
      highestPrice:originalPrice,
      averagePrice: price,
    };
    return result;
  } catch (error) {
    console.log(error);
  }
}
