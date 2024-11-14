import type { NextApiRequest, NextApiResponse } from "next";
import initDB from "@/utils/initDB";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    const server_token = process.env.AUTH_SECRET;

    console.log("server_token", server_token);
    console.log("token", token);

    if (!server_token) {
      return res.status(500).json({ error: "Server not configured" });
    }

    if (token !== server_token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await initDB();

    return res.status(200).json({ message: "Database initialized" });
  } catch (error) {
    console.error("DB init error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default handler;
