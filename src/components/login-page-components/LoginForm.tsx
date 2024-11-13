"use client";

import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const form = event.currentTarget;
      const login = form.login.value;
      const password = form.password.value;

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      router.push("/dashboard");
    } catch (error) {
      setError((error as Error).message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="login" className="text-sm font-medium">
          Login
        </label>
        <input
          id="login"
          name="login"
          type="text"
          required
          minLength={3}
          placeholder="Enter your login"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Enter your password"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-2 bg-blue-500 text-white font-medium rounded"
      >
        {isLoading ? "Loading..." : "Sign in"}
      </button>
    </form>
  );
}