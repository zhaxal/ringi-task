import { useEffect, useState } from "react";

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  total_price: string;
}

interface OrderResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPage: number;
    hasMore: boolean;
  };
}

function OrderList() {
  const [data, setData] = useState<OrderResponse | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data: OrderResponse) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>...Loading</p>;
  if (!data) return <p>No orders data</p>;
  if (data.orders.length === 0) return <p>No orders</p>;

  return (
    <>
      <ul>
        {data.orders.map((item, i) => (
          <li key={i}>{item.customer_name}</li>
        ))}
      </ul>
    </>
  );
}

export default OrderList;
