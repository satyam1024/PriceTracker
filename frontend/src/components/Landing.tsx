import { useEffect, useState } from "react";
import axios from "axios";
import HeroCarousel from "./HeroCarousel";
import Searchbar from "./Searchbar";
import React from "react";
import ProductCard from "./ProductCard";
import Navbar from "./Navbar";

const Landing=()=> {
  // const allProducts = await getAllProducts();
  const [allProducts, setAllProducts] = useState([]);

  const [product, setProduct] = useState("");
  
  const fetchAllProduct = async () => {
    try {
      const response = await axios.get(`https://price-tracker-backend-ifbswwxfz-satyams-projects-9c7c8da9.vercel.app/products`);
      setAllProducts(response.data);
      console.log(response.data);
    } catch (error) {
      console.log("Failed to fetch product", error);
    }
  };
  useEffect(()=>{
    fetchAllProduct();
  },[])

  return (
    <>
        <Navbar/>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping Starts Here:
              <img
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
            Track. Compare. Save. Unlock the best deals with 
              <span className="text-primary"> Price Tracker</span>
            </h1>

            <p className="mt-6">
            Get real-time updates and never miss a deal again.
            </p>

            <Searchbar />
          </div>

          <HeroCarousel />
        </div>
      </section>
     
      <section className="trending-section">
        <h2 className="section-text">Trending</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product,index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

export default Landing;
