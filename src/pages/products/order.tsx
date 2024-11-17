import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

interface CartItem {
  id: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface OrderForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function Order() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderForm>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        router.push("/products/cart");
        return;
      }
      setCart(parsedCart);
    } else {
      router.push("/products/cart");
    }
  }, [router]);

  useEffect(() => {
    if (cart.length === 0) return;

    const productIds = cart.map((item) => item.id).join(",");
    fetch(`/api/public/products?ids=${productIds}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data.products);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [cart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getTotalPrice = () => {
    return products.reduce((total, product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      return total + product.price * (cartItem?.quantity || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          products: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      localStorage.removeItem("cart");
      router.push("/products/success");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create order"
      );
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <Link href="/products/cart" className="text-blue-600 hover:text-blue-500">
          Back to Cart
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center text-red-800">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {products.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              if (!cartItem) return null;

              return (
                <li key={product.id} className="p-6 flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {cartItem.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${(product.price * cartItem.quantity).toFixed(2)}
                  </p>
                </li>
              );
            })}
            <li className="p-6 flex justify-between bg-gray-50">
              <p className="text-base font-medium text-gray-900">Total</p>
              <p className="text-base font-medium text-gray-900">
                ${getTotalPrice().toFixed(2)}
              </p>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Customer Information
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                pattern="^\+?[\d\s-()]{8,}$"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
