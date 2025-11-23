'use client';

import type { LayoutProps } from '@shopana/next-ecommerce-core';

export default function MainLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Shopana Store</h1>
          <nav className="mt-2">
            <a href="/" className="mr-4 hover:underline">
              Home
            </a>
            <a href="/products" className="mr-4 hover:underline">
              Products
            </a>
            <a href="/collections" className="mr-4 hover:underline">
              Collections
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">{children}</main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Shopana Store. Built with Next.js and @shopana/next-ecommerce-core</p>
        </div>
      </footer>
    </div>
  );
}
