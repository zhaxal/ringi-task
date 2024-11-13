import pool from "@/database";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const user = await pool.query("SELECT id, login FROM users WHERE id = $1", [
      userId,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;
