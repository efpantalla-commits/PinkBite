
import { API_URL } from './config';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// GET all restaurants
export async function getRestaurants() {
  return await apiRequest('/restaurants');
}

// GET all categories
export async function getCategories() {
  return await apiRequest('/categories');
}

// GET all menu items
export async function getMenuItems() {
  return await apiRequest('/menu-items');
}
