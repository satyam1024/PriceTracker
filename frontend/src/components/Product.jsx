import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "./Modal";
import PriceInfoCard from "./PriceInfoCard";
import ProductCard from "./ProductCard";
import axios from "axios";

import { formatNumber } from "../../../backend/utils";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  const fetchProduct = async (productId) => {
    try {
      const response = await axios.get(
        `https://price-tracker-backend-inky.vercel.app/products/${productId}`
      );
      return response.data;
    } catch (error) {
      console.log("Failed to fetch product", error);
    }
  };

  const fetchSimilarProducts = async (productId) => {
    try {
      const response = await axios.get(
        `https://price-tracker-backend-inky.vercel.app/similar-products/${productId}`
      );
      return response.data;
    } catch (error) {
      console.log("Failed to fetch product", error);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productData = await fetchProduct(id);
        console.log(productData);
        // if (!productData) {
        //   window.location.href = "/";
        // }
        setProduct(productData);

        const similarData = await fetchSimilarProducts(id);
        setSimilarProducts(similarData);
      } catch (error) {
        console.error("Failed to fetch product data", error);
      }
    };

    fetchProductData();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div className="product-image">
          <img
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>

              <Link
                to={{ pathname: product.url }}
                target="_blank"
                className="text-base text-black opacity-50"
              >
                Visit Product
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <img
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />
                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <img
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <img
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="flex flex-col gap-2">
              <p className="text-[34px] text-secondary font-bold">
                {product.currency} {formatNumber(product.currentPrice)}
              </p>
              <p className="text-[21px] text-black opacity-50 line-through">
                {product.currency} {formatNumber(product.originalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <img
                    src="/assets/icons/star.svg"
                    alt="star"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars || "25"}
                  </p>
                </div>

                <div className="product-reviews">
                  <img
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">93% </span>{" "}
                of buyers have recommended this.
              </p>
            </div>
          </div>

          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              <PriceInfoCard
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(
                  product.currentPrice
                )}`}
              />
              <PriceInfoCard
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(
                  product.averagePrice
                )}`}
              />
              <PriceInfoCard
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(
                  product.highestPrice
                )}`}
              />
              <PriceInfoCard
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(
                  product.lowestPrice
                )}`}
              />
            </div>
          </div>

          <Modal productId={id} />
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl text-secondary font-semibold">
            Product Description
          </h3>

          <div className="flex flex-col gap-4">
            {product?.description?.split("\n")}
          </div>
        </div>

        <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
          <img src="/assets/icons/bag.svg" alt="check" width={22} height={22} />

          <Link to={`${product.url}`} className="text-base text-white">
            Buy Now
          </Link>
        </button>
      </div>

      {similarProducts && similarProducts?.length > 0 && (
        <div className="py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>

          <div className="flex flex-wrap gap-10 mt-7 w-full">
            {similarProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
