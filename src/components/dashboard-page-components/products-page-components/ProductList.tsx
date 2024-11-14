import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPage: number;
    hasMore: boolean;
  };
}

function ProductList() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: ProductsResponse) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No products data</p>;
  if (data.products.length === 0) return <p>No products</p>;

  return (
    <>
      <ul>
        {data.products.map((item, i) => (
          <li key={i}>{item.name}</li>
        ))}
      </ul>
    </>
  );
}

export default ProductList;
