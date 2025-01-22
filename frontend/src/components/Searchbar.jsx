import { scrapeAndStoreProduct } from "../../../backend/api/index";
import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const isValidAmazonProductURL = (url) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const scrapeProduct = async (productUrl) => {
    try {
      const response = await axios.post("http://localhost:5000/scrape", {
        productUrl,
      });
      navigate(`/product/${response.data}`);
    } catch (error) {
      console.error("Error scraping product:", error);
      alert("Failed to scrape and store product");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if (!isValidLink) return alert("Please provide a valid Amazon link");

    try {
      setIsLoading(true);

      const product = await scrapeProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ""}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;
