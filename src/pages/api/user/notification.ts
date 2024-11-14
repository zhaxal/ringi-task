import pool from "@/database";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(400).json({ error: "Missing user ID" });
      return;
    }

    const { fcm_token } = req.body;

    if (!fcm_token) {
      res.status(400).json({ error: "Missing FCM token" });
      return;
    }

    await pool.query(
      `
      INSERT INTO user_fcm (user_id, fcm_token)
      VALUES ($1, $2)
      ON CONFLICT (user_id, fcm_token) DO NOTHING
    `,
      [userId, fcm_token]
    );

    res.status(201).end();
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;