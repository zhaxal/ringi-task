import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/utils/withAuth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    res.status(200).json({
      id: req.user.id,
      login: req.user.login,
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler);