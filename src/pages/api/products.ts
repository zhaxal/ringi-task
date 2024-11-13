import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case "GET":
      {
        try {
          const page = Number(req.query.page) || 1;
          const limit = Number(req.query.limit) || 10;
          const offset = (page - 1) * limit;

          const products = await pool.query(
            `
          SELECT id, name, price, description, stock
          FROM products
          ORDER BY id
          LIMIT $1 OFFSET $2;
          `,
            [limit, offset]
          );

          const total = await pool.query(`SELECT COUNT(*) FROM products`);

          const totalItems = parseInt(total.rows[0].count);
          const totalPages = Math.ceil(totalItems / limit);

          res.status(200).json({
            products: products.rows,
            pagination: {
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

    case "POST":
      {
        try {
          const { name, price, description, stock } = body;

          if (!name || !price || !stock) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          if (typeof name !== "string" || name.length < 3) {
            return res.status(400).json({
              message: "Name must be a string with at least 3 characters",
            });
          }

          if (typeof description !== "string" && description !== undefined) {
            return res.status(400).json({
              message: "Description must be a string",
            });
          }

          if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({
              message: "Price must be a number greater than 0",
            });
          }

          if (typeof stock !== "number" || stock < 0) {
            return res.status(400).json({
              message: "Stock must be a number greater or equal to 0",
            });
          }

          const newProduct = await pool.query(
            `
            INSERT INTO products (name, price, description, stock)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
          `,
            [name, price, description, stock]
          );

          res.status(200).json({
            message: "Product created successfully",
            product: {
              id: newProduct.rows[0].id,
            },
          });
        } catch (error) {
          console.error("Create product error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }

      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
