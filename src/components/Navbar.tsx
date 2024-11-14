import Link from "next/link";

function Navbar() {
  return (
    <nav className="bg-gray-600 text-gray-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div>CRM System</div>

          <div className="space-x-6">
            <Link href="/dashboard/products">Products</Link>
            <Link href="/dashboard/orders">Orders</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
