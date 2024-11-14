import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;

  switch (method) {
    case "GET":
      {
        try {
          const id = Number(query.id);
          if (!id) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          if (typeof id !== "number" || id <= 0) {
            return res.status(400).json({
              message: "ID must be a number greater than 0",
            });
          }

          const product = await pool.query(
            `
            SELECT id, name, price, description, stock
            FROM products
            WHERE id = $1;
          `,
            [id]
          );

          if (product.rowCount === 0) {
            return res.status(404).json({ message: "Product not found" });
          }

          res.status(200).json({ product: product.rows[0] });
        } catch (error) {
          console.error("Get product error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
      break;
    case "PUT":
      {
        try {
          const id = Number(query.id);

          const { name, price, description, stock } = body;

          if (!id || !name || !price || !stock) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          if (typeof id !== "number" || id <= 0) {
            return res.status(400).json({
              message: "ID must be a number greater than 0",
            });
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

          const updatedProduct = await pool.query(
            `
            UPDATE products
            SET name = $1, price = $2, description = $3, stock = $4
            WHERE id = $5
            RETURNING id;
          `,
            [name, price, description, stock, id]
          );

          if (updatedProduct.rowCount === 0) {
            return res.status(404).json({ message: "Product not found" });
          }

          res.status(200).json({
            message: "Product updated successfully",
            product: {
              id: updatedProduct.rows[0].id,
            },
          });
        } catch (error) {
          console.error("Update product error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
      break;

    case "DELETE": {
      try {
        const id = Number(query.id);

        if (!id) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        if (typeof id !== "number" || id <= 0) {
          return res.status(400).json({
            message: "ID must be a number greater than 0",
          });
        }

        const orderCheck = await pool.query(
          `
            SELECT COUNT(*) 
            FROM order_items 
            WHERE product_id = $1
            `,
          [id]
        );

        if (orderCheck.rows[0].count > 0) {
          return res.status(400).json({
            message: "Cannot delete product that is used in orders",
          });
        }

        const deletedProduct = await pool.query(
          `
            DELETE FROM products
            WHERE id = $1
            RETURNING id;
            `,
          [id]
        );

        if (deletedProduct.rowCount === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
          message: "Product deleted successfully",
          product: {
            id: deletedProduct.rows[0].id,
          },
        });
      } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
