import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  stock: number;
}

interface ProductResponse {
  product: Product;
}

interface DeleteError {
  message: string;
}

export default function SellerProductDetails() {
  const router = useRouter();
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${router.query.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data: ProductResponse) => {
        setData(data.product);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router.query.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/products/${router.query.id}`, {
        method: "DELETE",
      });
    
      let errorData: DeleteError | null = null;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error("Failed to parse error response");
        }

        setDeleteError(errorData?.message || "Failed to delete product");
        setIsDeleting(false);
        return;
      }
    
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError(error instanceof Error ? error.message : "Failed to delete product");
      setIsDeleting(false);
    }
  };

  if (error || isLoading || !data) {
    if (isLoading) {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-8">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-3">
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-md">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Product
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/dashboard/products"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This product may have been removed or is no longer available.
          </p>
          <Link
            href="/dashboard/products"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {deleteError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center text-red-800">
            <span className="mr-2">⚠️</span>
            {deleteError}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <nav>
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/dashboard/products" className="hover:text-blue-600">
                Products
              </Link>
            </li>
            <li>→</li>
            <li className="font-medium text-gray-900">{data.name}</li>
          </ol>
        </nav>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/products/${data.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isDeleting 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{data.name}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-500 mb-1">Price</p>
              <p className="font-semibold text-gray-900">{data.price}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-500 mb-1">Stock</p>
              <p
                className={`font-semibold ${
                  data.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.stock} units
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Description
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            {data.description}
          </p>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.stock >= 10 && (
                <div className="p-4 bg-green-50 text-green-800 rounded-md">
                  ✅ In stock: Product visible to customers
                </div>
              )}

              {data.stock < 10 && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                  ⚠️ Low stock alert: Consider restocking soon
                </div>
              )}
              {data.stock === 0 && (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                  ❌ Out of stock: Product not visible to customers
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
