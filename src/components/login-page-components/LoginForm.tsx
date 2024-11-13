"use client";

import { useFormState, useFormStatus } from "react-dom";

interface FormState {
  error?: string;
}

async function loginAction(prevState: FormState, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "All fields are required" };
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("token", data.token);
    window.location.href = "/dashboard";
    return { error: undefined };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Invalid credentials" };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, { error: undefined });

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}

      <div>
        <input
          name="username"
          type="text"
          required
          minLength={3}
          placeholder="Username"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
