import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../axios/Axios";

import productPlaceholder from "../../assets/images/placeholder-image.webp";
import { n_f } from "../../utils/helpers";

function GetAllProducts() {
  const [productList, setProductList] = useState([]); // Lưu danh sách sản phẩm từ API
  const { catId } = useParams();
  const [searchParams] = useSearchParams();

  async function fetchProduct() {
    try {
      const response = await axiosInstance.get(
        "https://coffeeshop.ngrok.app/api/products?sortBy=ProductId&isAscending=true&page=1&pageSize=10",
        {
          params: {
            sortBy: "ProductId",
            isAscending: true,
            page: 1,
            pageSize: 10,
          },
        }
      );

      if (response.data && response.data.products) {
        setProductList(response.data.products);
      } else {
        console.error("Dữ liệu API không hợp lệ:", response.data);
        setProductList([]);
      }
    } catch (error) {
      console.error("Lỗi fetch sản phẩm:", error);
      setProductList([]);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, []); // Gọi API khi component mount

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = React.useMemo(() => {
    let filtered = catId
      ? productList.filter((p) => p.categoryId === Number(catId))
      : productList;

    // Lấy tham số lọc từ URL
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("order") === "desc" ? -1 : 1;

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (typeof a[sortBy] === "string") {
          return order * a[sortBy].localeCompare(b[sortBy]);
        }
        return order * (a[sortBy] - b[sortBy]);
      });
    }

    return filtered;
  }, [catId, searchParams, productList]);

  // Xác định top 3 sản phẩm có nhiều stock nhất
  const top3HotProducts = [...productList]
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, 3)
    .map((p) => p.productId);

  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-3 justify-items-center content-around gap-3 gap-y-16 mt-10">
      {filteredProducts.map((product) => (
        <Link to={`/cart?productId=${product.productId}`} key={product.productId}>
          <section className="relative w-36 bg-white shadow-lg hover:shadow-xl duration-200 p-5 rounded-3xl flex flex-col h-full">
            {/* Ký hiệu HOT */}
            {top3HotProducts.includes(product.productId) && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                HOT
              </span>
            )}
            <img
              src={product.path ? `https://coffeeshop.ngrok.app/api/products/image${product.path}` : productPlaceholder}
              alt={product.productName}
              className="aspect-square rounded-full object-cover mt-[-50%] w-full mb-3 shadow-lg"
            />

            <div className="flex flex-col gap-2 text-center flex-grow">
              <p className="font-black text-lg">{product.productName}</p>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <p className="font-bold text-tertiary">{n_f(product.price)} VND</p>
            </div>
          </section>
        </Link>
      ))}
    </section>
  );
}

export default GetAllProducts;
