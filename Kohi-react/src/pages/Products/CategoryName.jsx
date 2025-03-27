import React, { useEffect, useState } from "react";

const CategoryName = ({ categoryId }) => {
  const [categoryName, setCategoryName] = useState("Loading...");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`https://coffeeshop.ngrok.app/api/categories/${categoryId}`);
        const data = await response.json();
        setCategoryName(data.categoryName || "Unknown"); // Cập nhật đúng field
      } catch (error) {
        console.error(`Error fetching category ${categoryId}:`, error);
        setCategoryName("Error");
      }
    };

    fetchCategory();
  }, [categoryId]);

  return <>{categoryName}</>;
};

export default CategoryName;
