import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      {
        try {
          const { ids } = query;
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;
          const offset = (page - 1) * limit;

          let productIds: number[] = [];
          if (ids) {
            productIds = ids
              .toString()
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id));
          }

          let products;
          let total;

          if (productIds.length > 0) {
            products = await pool.query(
              `
              SELECT id, name, price, description, stock
              FROM products
              WHERE id = ANY($1)
              ORDER BY id;
              `,
              [productIds]
            );

            total = { rows: [{ count: productIds.length }] };
          } else {
            products = await pool.query(
              `
              SELECT id, name, price, description, stock
              FROM products
              ORDER BY id
              LIMIT $1 OFFSET $2;
              `,
              [limit, offset]
            );

            total = await pool.query(`SELECT COUNT(*) FROM products`);
          }

          const totalItems = parseInt(total.rows[0].count);
          const totalPages = Math.ceil(totalItems / limit);

          res.status(200).json({
            products: products.rows,
            pagination: productIds.length > 0 ? null : {
              page,
              limit,
              totalItems,
              totalPages,
              hasMore: page < totalPages,
            },
          });
        } catch (error) {
          console.error("Get products error:", error);
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
