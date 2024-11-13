import type { NextApiRequest, NextApiResponse } from "next";

import pool from "@/database";
import { compareSync } from "bcrypt-ts";
import { v4 as uuidv4 } from "uuid";

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
      res.status(400).send("Login and password are required");
      return;
    }

    const user = await pool.query("SELECT * FROM users WHERE login = $1", [
      login,
    ]);

    if (
      user.rows.length === 0 ||
      !compareSync(password, user.rows[0].password)
    ) {
      res.status(401).send("Invalid login or password");
      return;
    }

    const token = uuidv4();

    await pool.query(
      `DELETE FROM sessions 
       WHERE user_id = $1`,
      [user.rows[0].id]
    );

    await pool.query(
      `INSERT INTO sessions (user_id, token) 
       VALUES ($1, $2)`,
      [user.rows[0].id, token]
    );

    res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/`);

    res.status(201).end();
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
