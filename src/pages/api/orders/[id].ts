import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case "PATCH":
      {
        try {
          const { id } = query;

          const order = await pool.query(
            `
          UPDATE orders
          SET status = $1
          WHERE id = $2
          RETURNING *;
          `,
            ["completed", id]
          );

          if (order.rowCount === 0) {
            return res.status(404).json({ message: "Order not found" });
          }

          res.status(200).json({ message: "Order updated" });
        } catch (error) {
          console.error("Update order error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }

      break;

    default:
      res.setHeader("Allow", ["PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
