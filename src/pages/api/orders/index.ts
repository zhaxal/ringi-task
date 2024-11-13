import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      {
        try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;
          const offset = (page - 1) * limit;

          const orders = await pool.query(
            `
          SELECT id, customer_name, customer_email, customer_phone, status, total_price
          FROM orders
          ORDER BY id
          LIMIT $1 OFFSET $2;
          `,
            [limit, offset]
          );

          const total = await pool.query(`SELECT COUNT(*) FROM orders`);

          const totalItems = parseInt(total.rows[0].count);
          const totalPages = Math.ceil(totalItems / limit);

          res.status(200).json({
            orders: orders.rows,
            pagination: {
              page,
              limit,
              totalItems,
              totalPages,
              hasMore: page < totalPages,
            },
          });
        } catch (error) {
          console.error("Get orders error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }

      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
