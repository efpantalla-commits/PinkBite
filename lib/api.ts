
import { API_URL } from './config';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// RESTAURANTS
export async function getRestaurants() {
  return await apiRequest('/restaurants');
}

export async function createRestaurant(data: {
  owner_id: number;
  restaurant_name: string;
  cuisine_type: string;
  address: string;
}) {
  return await apiRequest('/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRestaurant(id: number, data: {
  restaurant_name: string;
  cuisine_type: string;
  address: string;
  is_active: number;
}) {
  return await apiRequest(`/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRestaurant(id: number) {
  return await apiRequest(`/restaurants/${id}`, {
    method: 'DELETE',
  });
}

// CATEGORIES
export async function getCategories() {
  return await apiRequest('/categories');
}

export async function createCategory(data: {
  restaurant_id: number;
  category_name: string;
}) {
  return await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: {
  restaurant_id: number;
  category_name: string;
}) {
  return await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number) {
  return await apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// MENU ITEMS
export async function getMenuItems() {
  return await apiRequest('/menu-items');
}

export async function createMenuItem(data: {
  restaurant_id: number;
  category_id: number;
  item_name: string;
  description: string;
  price: number;
  is_available: number;
}) {
  return await apiRequest('/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(id: number, data: {
  restaurant_id: number;
  category_id: number;
  item_name: string;
  description: string;
  price: number;
  is_available: number;
}) {
  return await apiRequest(`/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(id: number) {
  return await apiRequest(`/menu-items/${id}`, {
    method: 'DELETE',
  });
}
