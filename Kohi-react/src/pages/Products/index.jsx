import React, { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation, useSearchParams } from "react-router-dom";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import useDocumentTitle from "../../utils/documentTitle";
import GetAllProducts from "./GetAllProducts";
import CategoryName from "./CategoryName";

function Products(props) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://coffeeshop.ngrok.app/api/categories?sortBy=CategoryId&isAscending=true&page=1&pageSize=10");
        const data = await response.json();
        console.log("Categories API Response:", data); // Log dữ liệu trả về
        setCategories(data.categories  || []); // Kiểm tra xem có "items" không
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
  
    fetchCategories();
  }, []);
  

  // Set default search parameter
  useEffect(() => {
    if (location.pathname === "/products" && !searchParams.has("q")) {
      setSearchParams({ q: "all" });
    }
  }, [location.pathname, searchParams, setSearchParams]);

  useDocumentTitle(props.title);

  // Update filter
  const handleFilterChange = (type) => {
    const currentSortBy = searchParams.get("sortBy");
    const currentOrder = searchParams.get("order") || "asc";
    const newOrder = currentSortBy === type && currentOrder === "asc" ? "desc" : "asc";
    setSearchParams({ ...Object.fromEntries(searchParams), sortBy: type, order: newOrder });
  };

  return (
    <>
      <Header />
      <main className="flex flex-col md:flex-row global-px">
        <section className="flex-[2_2_0%] flex flex-col md:pl-16 py-5">
          {/* Tabs */}
          <nav className="list-none flex flex-row md:justify-between justify-evenly flex-wrap gap-5 mb-10">
  <li>
    <NavLink to="/products?q=all" end className={({ isActive }) => isActive ? "text-white bg-primary px-4 py-2 rounded-full shadow-md" : "text-gray-600"}>
      All
    </NavLink>
  </li>
  {categories?.map((category) => (
  <li key={category.categoryId}>
    <NavLink to={`/products/category/${category.categoryId}`} 
      className={({ isActive }) => isActive ? "text-white bg-primary px-4 py-2 rounded-full shadow-md" : "text-gray-600"}>
      <CategoryName categoryId={category.categoryId} />  {/* Dùng component để lấy tên từ API */}
    </NavLink>
  </li>
))}
</nav>

          {/* Filters */}
          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={() => handleFilterChange("price")}
              className={`px-6 py-2 rounded-full shadow-md transition-all duration-300 ${
                searchParams.get("sortBy") === "price" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Giá {searchParams.get("sortBy") === "price" ? (searchParams.get("order") === "asc" ? "⬆️" : "⬇️") : ""}
            </button>
            <button
              onClick={() => handleFilterChange("productName")}
              className={`px-6 py-2 rounded-full shadow-md transition-all duration-300 ${
                searchParams.get("sortBy") === "productName" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Tên {searchParams.get("sortBy") === "productName" ? (searchParams.get("order") === "asc" ? "⬆️" : "⬇️") : ""}
            </button>
          </div>

          {/* Product List */}
          <Routes>
            <Route index element={<GetAllProducts />} />
            <Route path="category/:catId" element={<GetAllProducts />} />
          </Routes>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Products;
