
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'Customer',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      router.push('/login');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF5F8] p-6">
      <Card className="w-full max-w-md rounded-3xl border-pink-100 bg-white shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-extrabold text-[#E85D8E]">
            PinkBite<span className="text-[#29232A]">.</span>
          </CardTitle>

          <CardDescription className="text-gray-500">
            Create your account and discover delicious meals!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-pink-200 focus-visible:ring-[#E85D8E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-pink-200 focus-visible:ring-[#E85D8E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="h-11 rounded-xl border-pink-200 focus-visible:ring-[#E85D8E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                placeholder="Enter your phone number"
                value={form.phone_number}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-pink-200 focus-visible:ring-[#E85D8E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Role</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-pink-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#E85D8E]"
              >
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor</option>
                <option value="Rider">Rider</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[#E85D8E] font-semibold text-white hover:bg-[#D94B7D]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-semibold text-[#E85D8E] hover:underline"
              >
                Login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
