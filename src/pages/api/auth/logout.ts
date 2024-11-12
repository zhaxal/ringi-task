import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/utils/withAuth";

import pool from "@/database";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const userId = req.user.id;

    await pool.query("DELETE FROM sessions WHERE user_id = $1", [userId]);

    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler);
