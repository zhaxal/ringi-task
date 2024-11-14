import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

import { v4 as uuidv4 } from "uuid";
import { genSaltSync, hashSync } from "bcrypt-ts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "Missing login or password" });
    }

    if (typeof login !== "string" || login.length < 3) {
      return res.status(400).json({
        error: "Login must be a string with at least 3 characters",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "Password must be a string with at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE login = $1",
      [login]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = genSaltSync(10);

    const newUser = await pool.query(
      "INSERT INTO users (login, password) VALUES ($1, $2) RETURNING id",
      [login, hashSync(password, salt)]
    );

    await pool.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = 'seller'))",
      [newUser.rows[0].id]
    );

    const token = uuidv4();
    await pool.query("INSERT INTO sessions (user_id, token) VALUES ($1, $2)", [
      newUser.rows[0].id,
      token,
    ]);

    const isSecure = process.env.NODE_ENV === "production";
    const cookieOptions = `HttpOnly; Path=/; ${
      isSecure ? "Secure; SameSite=Strict" : ""
    }`;

    res.setHeader("Set-Cookie", `token=${token}; ${cookieOptions}`);

    return res.status(201).end();
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
