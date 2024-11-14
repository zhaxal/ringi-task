import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Welcome to Shop Management System
      </h1>
      
      <p className="text-xl mb-8 max-w-2xl">
        A powerful platform to manage your products and orders efficiently.
      </p>
      
      <div className="space-x-4">
        <Link 
          href="/products" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
        >
          View Products
        </Link>
        <Link 
          href="/dashboard" 
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
        >
          Manage Orders
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-3">Product Management</h2>
          <p>Add, edit, and track your product inventory with ease.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-3">Order Tracking</h2>
          <p>Monitor and manage customer orders in real-time.</p>
        </div>
      </div>
    </div>
  );
}