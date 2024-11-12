import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    login: string;
  };
}

type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void>;

export function withAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const session = await pool.query(
        "SELECT user_id, updated_at FROM sessions WHERE token = $1",
        [token]
      );

      if (session.rows.length === 0) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const lastUpdate = new Date(session.rows[0].updated_at);
      const now = new Date();
      const hoursSinceUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate > 24) {
        await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
        return res.status(401).json({ error: "Token expired" });
      }

      await pool.query(
        `UPDATE sessions 
         SET updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [session.rows[0].user_id]
      );

      const user = await pool.query(
        "SELECT id, login FROM users WHERE id = $1",
        [session.rows[0].user_id]
      );

      if (user.rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }

      (req as AuthenticatedRequest).user = {
        id: user.rows[0].id,
        login: user.rows[0].login,
      };

      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
