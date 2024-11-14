import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case "GET": {
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
    
        const orderDetails = await pool.query(
          `
          WITH order_details AS (
            SELECT 
              o.*,
              json_agg(
                json_build_object(
                  'product_id', p.id,
                  'name', p.name,
                  'price', p.price,
                  'quantity', oi.quantity
                )
              ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = $1
            GROUP BY o.id
          )
          SELECT 
            id,
            customer_name,
            customer_email,
            customer_phone,
            status,
            total_price,
            items
          FROM order_details;
          `,
          [id]
        );
    
        if (orderDetails.rowCount === 0) {
          return res.status(404).json({ message: "Order not found" });
        }
    
        res.status(200).json({ order: orderDetails.rows[0] });
      } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
    break;

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
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
