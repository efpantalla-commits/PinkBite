'use client';

import { useEffect, useState } from 'react';
import { logout } from '@/lib/auth';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  getRestaurants,
  getCategories,
  getMenuItems,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

type User = {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
};

type Restaurant = {
  restaurant_id: number;
  owner_id?: number;
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
  const [saving, setSaving] = useState(false);

  const [editingRestaurantId, setEditingRestaurantId] =
    useState<number | null>(null);

  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);

  const [editingMenuItemId, setEditingMenuItemId] =
    useState<number | null>(null);

  const [restaurantForm, setRestaurantForm] = useState({
    restaurant_name: '',
    cuisine_type: '',
    address: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    restaurant_id: '',
    category_name: '',
  });

  const [menuItemForm, setMenuItemForm] = useState({
    restaurant_id: '',
    category_id: '',
    item_name: '',
    description: '',
    price: '',
    is_available: '1',
  });

  async function loadDashboard() {
    try {
      setError('');

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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    loadDashboard();
  }, []);

  // RESTAURANT CRUD

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = e.target;

    setRestaurantForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleRestaurantSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!user) {
      setError('Please log in again before adding a restaurant.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingRestaurantId !== null) {
        const currentRestaurant = restaurants.find(
          (restaurant) =>
            restaurant.restaurant_id === editingRestaurantId,
        );

        await updateRestaurant(editingRestaurantId, {
          restaurant_name: restaurantForm.restaurant_name,
          cuisine_type: restaurantForm.cuisine_type,
          address: restaurantForm.address,
          is_active: currentRestaurant?.is_active ?? 1,
        });
      } else {
        await createRestaurant({
          owner_id: user.user_id,
          restaurant_name: restaurantForm.restaurant_name,
          cuisine_type: restaurantForm.cuisine_type,
          address: restaurantForm.address,
        });
      }

      setRestaurantForm({
        restaurant_name: '',
        cuisine_type: '',
        address: '',
      });

      setEditingRestaurantId(null);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save restaurant',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditRestaurant(restaurant: Restaurant) {
    setEditingRestaurantId(restaurant.restaurant_id);

    setRestaurantForm({
      restaurant_name: restaurant.restaurant_name,
      cuisine_type: restaurant.cuisine_type,
      address: restaurant.address,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteRestaurant(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this restaurant?',
    );

    if (!confirmed) return;

    try {
      setError('');
      await deleteRestaurant(id);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete restaurant',
      );
    }
  }

  function cancelEdit() {
    setEditingRestaurantId(null);

    setRestaurantForm({
      restaurant_name: '',
      cuisine_type: '',
      address: '',
    });
  }

  // CATEGORY CRUD

  async function handleCategorySubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const data = {
        restaurant_id: Number(categoryForm.restaurant_id),
        category_name: categoryForm.category_name,
      };

      if (editingCategoryId !== null) {
        await updateCategory(editingCategoryId, data);
      } else {
        await createCategory(data);
      }

      setCategoryForm({
        restaurant_id: '',
        category_name: '',
      });

      setEditingCategoryId(null);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save category',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditCategory(category: Category) {
    setEditingCategoryId(category.category_id);

    setCategoryForm({
      restaurant_id: String(category.restaurant_id),
      category_name: category.category_name,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteCategory(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?',
    );

    if (!confirmed) return;

    try {
      setError('');
      await deleteCategory(id);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete category',
      );
    }
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null);

    setCategoryForm({
      restaurant_id: '',
      category_name: '',
    });
  }

  // MENU ITEMS CRUD

  async function handleMenuItemSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const data = {
        restaurant_id: Number(menuItemForm.restaurant_id),
        category_id: Number(menuItemForm.category_id),
        item_name: menuItemForm.item_name,
        description: menuItemForm.description,
        price: Number(menuItemForm.price),
        is_available: Number(menuItemForm.is_available),
      };

      if (editingMenuItemId !== null) {
        await updateMenuItem(editingMenuItemId, data);
      } else {
        await createMenuItem(data);
      }

      setMenuItemForm({
        restaurant_id: '',
        category_id: '',
        item_name: '',
        description: '',
        price: '',
        is_available: '1',
      });

      setEditingMenuItemId(null);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save menu item',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditMenuItem(item: MenuItem) {
    setEditingMenuItemId(item.item_id);

    setMenuItemForm({
      restaurant_id: String(item.restaurant_id),
      category_id: String(item.category_id),
      item_name: item.item_name,
      description: item.description || '',
      price: String(item.price),
      is_available: String(item.is_available),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteMenuItem(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this menu item?',
    );

    if (!confirmed) return;

    try {
      setError('');
      await deleteMenuItem(id);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete menu item',
      );
    }
  }

  function cancelMenuItemEdit() {
    setEditingMenuItemId(null);

    setMenuItemForm({
      restaurant_id: '',
      category_id: '',
      item_name: '',
      description: '',
      price: '',
      is_available: '1',
    });
  }

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

            <Button
              onClick={logout}
              variant="outline"
              className="rounded-full border-pink-200 text-[#E85D8E] hover:bg-pink-50"
            >
              Logout
            </Button>
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

        {!loading && (
          <>         {/* RESTAURANT FORM */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {editingRestaurantId !== null
                    ? 'Edit Restaurant'
                    : 'Add a Restaurant'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage restaurants in PinkBite.
                </p>
              </div>

              <Card className="rounded-2xl border-pink-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <form
                    onSubmit={handleRestaurantSubmit}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <div>
                      <label htmlFor="restaurant_name" className="mb-2 block text-sm font-semibold">
                        Restaurant Name
                      </label>

                      <input
                        id="restaurant_name"
                        name="restaurant_name"
                        value={restaurantForm.restaurant_name}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter restaurant name"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div>
                      <label htmlFor="cuisine_type" className="mb-2 block text-sm font-semibold">
                        Cuisine Type
                      </label>

                      <input
                        id="cuisine_type"
                        name="cuisine_type"
                        value={restaurantForm.cuisine_type}
                        onChange={handleFormChange}
                        required
                        placeholder="Example: Filipino"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="mb-2 block text-sm font-semibold">
                        Address
                      </label>

                      <input
                        id="address"
                        name="address"
                        value={restaurantForm.address}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter restaurant address"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 sm:col-span-2">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="rounded-full bg-[#E85D8E] px-6 text-white hover:bg-[#A83260]"
                      >
                        {saving
                          ? 'Saving...'
                          : editingRestaurantId !== null
                            ? 'Update Restaurant'
                            : 'Add Restaurant'}
                      </Button>

                      {editingRestaurantId !== null && (
                        <Button
                          type="button"
                          onClick={cancelEdit}
                          variant="outline"
                          className="rounded-full border-pink-200"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>

            {/* CATEGORY FORM */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {editingCategoryId !== null
                    ? 'Edit Category'
                    : 'Add a Food Category'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage food categories in PinkBite.
                </p>
              </div>

              <Card className="rounded-2xl border-pink-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <form
                    onSubmit={handleCategorySubmit}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <div>
                      <label htmlFor="category_name" className="mb-2 block text-sm font-semibold">
                        Category Name
                      </label>

                      <input
                        id="category_name"
                        value={categoryForm.category_name}
                        onChange={(e) =>
                          setCategoryForm((previous) => ({
                            ...previous,
                            category_name: e.target.value,
                          }))
                        }
                        required
                        placeholder="Example: Desserts"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div>
                      <label htmlFor="category_restaurant" className="mb-2 block text-sm font-semibold">
                        Select Restaurant
                      </label>

                      <select
                        id="category_restaurant"
                        value={categoryForm.restaurant_id}
                        onChange={(e) =>
                          setCategoryForm((previous) => ({
                            ...previous,
                            restaurant_id: e.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-[#E85D8E]"
                      >
                        <option value="">Choose a restaurant</option>

                        {restaurants.map((restaurant) => (
                          <option
                            key={restaurant.restaurant_id}
                            value={restaurant.restaurant_id}
                          >
                            {restaurant.restaurant_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:col-span-2">
                      <Button
                        type="submit"
                        disabled={saving || restaurants.length === 0}
                        className="rounded-full bg-[#E85D8E] px-6 text-white hover:bg-[#A83260]"
                      >
                        {saving
                          ? 'Saving...'
                          : editingCategoryId !== null
                            ? 'Update Category'
                            : 'Add Category'}
                      </Button>

                      {editingCategoryId !== null && (
                        <Button
                          type="button"
                          onClick={cancelCategoryEdit}
                          variant="outline"
                          className="rounded-full border-pink-200"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>

            {/* MENU ITEM FORM */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {editingMenuItemId !== null
                    ? 'Edit Menu Item'
                    : 'Add a Menu Item'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage food items in PinkBite.
                </p>
              </div>

              <Card className="rounded-2xl border-pink-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <form
                    onSubmit={handleMenuItemSubmit}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Item Name
                      </label>

                      <input
                        value={menuItemForm.item_name}
                        onChange={(e) =>
                          setMenuItemForm((previous) => ({
                            ...previous,
                            item_name: e.target.value,
                          }))
                        }
                        required
                        placeholder="Example: Chicken Burger"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={menuItemForm.price}
                        onChange={(e) =>
                          setMenuItemForm((previous) => ({
                            ...previous,
                            price: e.target.value,
                          }))
                        }
                        required
                        placeholder="Enter price"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold">
                        Description
                      </label>

                      <input
                        value={menuItemForm.description}
                        onChange={(e) =>
                          setMenuItemForm((previous) => ({
                            ...previous,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe the food item"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-[#E85D8E]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Select Restaurant
                      </label>

                      <select
                        value={menuItemForm.restaurant_id}
                        onChange={(e) =>
                          setMenuItemForm((previous) => ({
                            ...previous,
                            restaurant_id: e.target.value,
                            category_id: '',
                          }))
                        }
                        required
                        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-[#E85D8E]"
                      >
                        <option value="">Choose a restaurant</option>

                        {restaurants.map((restaurant) => (
                          <option
                            key={restaurant.restaurant_id}
                            value={restaurant.restaurant_id}
                          >
                            {restaurant.restaurant_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Select Category
                      </label>

                      <select
                        value={menuItemForm.category_id}
                        onChange={(e) =>
                          setMenuItemForm((previous) => ({
                            ...previous,
                            category_id: e.target.value,
                          }))
                        }
                        required
                        disabled={!menuItemForm.restaurant_id}
                        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-[#E85D8E]"
                      >
                        <option value="">Choose a category</option>

                        {categories
                          .filter(
                            (category) =>
                              Number(category.restaurant_id) ===
                              Number(menuItemForm.restaurant_id),
                          )
                          .map((category) => (
                            <option
                              key={category.category_id}
                              value={category.category_id}
                            >
                              {category.category_name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Availability
                      </label>

                      <select
                        value={menuItemForm.is_available}
                        onChange={(e) =>
                          setMenuItemForm((previous) => ({
                            ...previous,
                            is_available: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-[#E85D8E]"
                      >
                        <option value="1">Available</option>
                        <option value="0">Unavailable</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:col-span-2">
                      <Button
                        type="submit"
                        disabled={
                          saving ||
                          restaurants.length === 0 ||
                          categories.filter(
                            (category) =>
                              Number(category.restaurant_id) ===
                              Number(menuItemForm.restaurant_id),
                          ).length === 0
                        }
                        className="rounded-full bg-[#E85D8E] px-6 text-white hover:bg-[#A83260]"
                      >
                        {saving
                          ? 'Saving...'
                          : editingMenuItemId !== null
                            ? 'Update Menu Item'
                            : 'Add Menu Item'}
                      </Button>

                      {editingMenuItemId !== null && (
                        <Button
                          type="button"
                          onClick={cancelMenuItemEdit}
                          variant="outline"
                          className="rounded-full border-pink-200"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>
                        {/* FOOD CATEGORIES */}
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
                    <Card
                      key={category.category_id}
                      className="rounded-2xl border-pink-100 bg-white shadow-sm"
                    >
                      <CardContent className="p-5">
                        <div className="mb-3 text-4xl">🍽️</div>

                        <h3 className="text-lg font-bold">
                          {category.category_name}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                          Restaurant ID: {category.restaurant_id}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <Button
                            onClick={() => handleEditCategory(category)}
                            variant="outline"
                            className="flex-1 rounded-full border-pink-200 text-[#E85D8E] hover:bg-pink-50"
                          >
                            Edit
                          </Button>

                          <Button
                            onClick={() =>
                              handleDeleteCategory(category.category_id)
                            }
                            variant="outline"
                            className="flex-1 rounded-full border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* OUR MENU */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Our Menu
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Discover delicious meals from our restaurants.
                </p>
              </div>

              {menuItems.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-gray-500">
                  No menu items available yet.
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {menuItems.map((item) => {
                    const restaurant = restaurants.find(
                      (r) => r.restaurant_id === item.restaurant_id,
                    );

                    const category = categories.find(
                      (c) => c.category_id === item.category_id,
                    );

                    return (
                      <Card
                        key={item.item_id}
                        className="overflow-hidden rounded-2xl border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex h-36 items-center justify-center bg-[#FCE4EC] text-7xl">
                          🍛
                        </div>

                        <CardContent className="p-5">
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
                              {item.is_available === 1
                                ? 'Available'
                                : 'Unavailable'}
                            </span>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => handleEditMenuItem(item)}
                              variant="outline"
                              className="flex-1 rounded-full border-pink-200 text-[#E85D8E] hover:bg-pink-50"
                            >
                              Edit
                            </Button>

                            <Button
                              onClick={() =>
                                handleDeleteMenuItem(item.item_id)
                              }
                              variant="outline"
                              className="flex-1 rounded-full border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* RESTAURANTS */}
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
                      <Card
                        key={restaurant.restaurant_id}
                        className="overflow-hidden rounded-2xl border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex h-36 items-center justify-center bg-[#FCE4EC] text-7xl">
                          🍽️
                        </div>

                        <CardContent className="p-5">
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

                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => handleEditRestaurant(restaurant)}
                              variant="outline"
                              className="flex-1 rounded-full border-pink-200 text-[#E85D8E] hover:bg-pink-50"
                            >
                              Edit
                            </Button>

                            <Button
                              onClick={() =>
                                handleDeleteRestaurant(restaurant.restaurant_id)
                              }
                              variant="outline"
                              className="flex-1 rounded-full border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </section>

            {/* USER ACCOUNT */}
            {user && (
              <section className="mt-12">
                <Card className="rounded-2xl border-pink-100 bg-white shadow-sm">
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
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