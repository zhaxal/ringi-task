import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    const session = await pool.query(
      "SELECT user_id, updated_at FROM sessions WHERE token = $1",
      [token]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user_id = session.rows[0].user_id;
    const updatedAt = new Date(session.rows[0].updated_at);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (updatedAt < twentyFourHoursAgo) {
      await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
      return res.status(401).json({ error: "Token expired" });
    }

    await pool.query(
      `UPDATE sessions 
       SET updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1`,
      [user_id]
    );

    res.status(200).json({ user_id });
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
