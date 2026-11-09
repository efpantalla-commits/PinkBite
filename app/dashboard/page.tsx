
'use client';

import { useEffect, useState } from 'react';
import { logout } from '@/lib/auth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  getRestaurants,
  getCategories,
  getMenuItems,
} from '@/lib/api';

type User = {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
};

type Restaurant = {
  restaurant_id: number;
  restaurant_name: string;
  cuisine_type: string;
  address: string;
  rating: string;
  is_active: number;
};

type Category = {
  category_id: number;
  restaurant_id: number;
  category_name: string;
};

type MenuItem = {
  item_id: number;
  restaurant_id: number;
  category_id: number;
  item_name: string;
  description: string;
  price: string;
  is_available: number;
};

export default function DashboardPage() {
  useAuthGuard();

  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    async function loadDashboard() {
      try {
        const [restaurantData, categoryData, menuData] =
          await Promise.all([
            getRestaurants(),
            getCategories(),
            getMenuItems(),
          ]);

        setRestaurants(restaurantData);
        setCategories(categoryData);
        setMenuItems(menuData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load dashboard data',
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF5F8] text-[#29232A]">
      <header className="border-b border-pink-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-extrabold text-[#E85D8E]">
            PinkBite<span className="text-[#29232A]">.</span>
          </h1>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              Hello, {user?.full_name || 'there'}!
            </span>

            <button
              onClick={logout}
              className="rounded-full border border-pink-200 px-5 py-2 text-sm font-semibold text-[#E85D8E] transition hover:bg-pink-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-[#F9D5E2] p-8 sm:p-12">
          <div className="relative z-10 max-w-xl">
            <p className="mb-3 font-semibold text-[#A83260]">
              GOOD FOOD, GOOD MOOD
            </p>

            <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Something delicious is waiting for you.
            </h2>

            <p className="mt-4 text-gray-700">
              Discover restaurants and find your next favorite meal.
            </p>
          </div>

          <div className="absolute -right-8 -bottom-12 text-[180px] opacity-30">
            🍓
          </div>
        </section>

        {loading && (
          <p className="mt-8 text-gray-500">
            Loading PinkBite...
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-xl bg-white p-4 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Food Categories */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Food Categories
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Explore categories from our restaurants.
                </p>
              </div>

              {categories.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-gray-500">
                  No categories available yet.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <article
                      key={category.category_id}
                      className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-3 text-4xl">🍽️</div>

                      <h3 className="text-lg font-bold">
                        {category.category_name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Restaurant ID: {category.restaurant_id}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Menu Items */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Our Menu
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Discover delicious meals from our restaurants.
                </p>
              </div>

              {menuItems.filter((item) => item.is_available === 1).length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-gray-500">
                  No menu items available yet.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {menuItems
                    .filter((item) => item.is_available === 1)
                    .map((item) => {
                      const restaurant = restaurants.find(
                        (r) => r.restaurant_id === item.restaurant_id,
                      );

                      const category = categories.find(
                        (c) => c.category_id === item.category_id,
                      );

                      return (
                        <article
                          key={item.item_id}
                          className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          <div className="flex h-36 items-center justify-center bg-[#FCE4EC] text-7xl">
                            🍛
                          </div>

                          <div className="p-5">
                            <h3 className="text-lg font-bold">
                              {item.item_name}
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                              {item.description}
                            </p>

                            <p className="mt-3 text-sm text-[#E85D8E]">
                              {category?.category_name || 'Uncategorized'}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {restaurant?.restaurant_name || 'Unknown Restaurant'}
                            </p>

                            <div className="mt-4 flex items-center justify-between border-t border-pink-100 pt-4">
                              <span className="text-lg font-extrabold text-[#A83260]">
                                ₱{Number(item.price).toFixed(2)}
                              </span>

                              <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-[#A83260]">
                                Available
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>
              )}
            </section>

            {/* Restaurants */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Restaurants Near You
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Discover restaurants available on PinkBite.
                </p>
              </div>

              {restaurants.filter((r) => r.is_active === 1).length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-gray-500">
                  No restaurants available yet.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {restaurants
                    .filter((restaurant) => restaurant.is_active === 1)
                    .map((restaurant) => (
                      <article
                        key={restaurant.restaurant_id}
                        className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex h-36 items-center justify-center bg-[#FCE4EC] text-7xl">
                          🍽️
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold">
                            {restaurant.restaurant_name}
                          </h3>

                          <p className="mt-2 text-sm text-[#E85D8E]">
                            {restaurant.cuisine_type}
                          </p>

                          <p className="mt-2 text-sm text-gray-500">
                            📍 {restaurant.address}
                          </p>

                          <div className="mt-4 flex items-center justify-between border-t border-pink-100 pt-4">
                            <span className="text-sm text-gray-600">
                              ⭐ {restaurant.rating}
                            </span>

                            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-[#A83260]">
                              Available
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </section>

            {/* User Account */}
            {user && (
              <section className="mt-12 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Your Account
                </h2>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <strong>Name:</strong> {user.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phone_number}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>User ID:</strong> {user.user_id}
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <footer className="mt-12 border-t border-pink-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © 2026 PinkBite. Made with love for food lovers.
      </footer>
    </main>
  );
}
