import type { NextApiRequest, NextApiResponse } from "next";

import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    await pool.query("DELETE FROM sessions WHERE user_id = $1", [userId]);

    await pool.query("DELETE FROM user_fcm WHERE user_id = $1", [userId]);

    res.status(201).end();
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;
