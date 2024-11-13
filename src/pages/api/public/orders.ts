import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case "POST":
      {
        try {
          const { customerName, customerEmail, customerPhone, products } = body;

          if (!customerName || !customerEmail || !customerPhone || !products) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          if (typeof customerName !== "string" || customerName.length < 3) {
            return res.status(400).json({
              message: "Name must be a string with at least 3 characters",
            });
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (
            typeof customerEmail !== "string" ||
            !emailRegex.test(customerEmail)
          ) {
            return res.status(400).json({
              message: "Please provide a valid email address",
            });
          }

          const phoneRegex = /^\+?[\d\s-()]{8,}$/;
          if (
            typeof customerPhone !== "string" ||
            !phoneRegex.test(customerPhone)
          ) {
            return res.status(400).json({
              message: "Please provide a valid phone number (minimum 8 digits)",
            });
          }

          if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "No products provided" });
          }

          const client = await pool.connect();

          let orderPrice = 0;
          let orderId;

          try {
            await client.query("BEGIN");

            const orderQuery = `
              INSERT INTO orders (customer_name, customer_email, customer_phone, status, total_price)
              VALUES ($1, $2, $3, 'pending', $4)
              RETURNING id
            `;

            for (const product of products) {
              const priceQuery = `
                SELECT price FROM products 
                WHERE id = $1
              `;
              const priceResult = await client.query(priceQuery, [product.id]);

              if (priceResult.rows.length === 0) {
                throw new Error(`Product ${product.id} not found`);
              }

              const productPrice = priceResult.rows[0].price;
              orderPrice += productPrice * product.quantity;
            }

            const orderResult = await client.query(orderQuery, [
              customerName,
              customerEmail,
              customerPhone,
              orderPrice,
            ]);
            orderId = orderResult.rows[0].id;

            for (const product of products) {
              const orderItemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity)
                VALUES ($1, $2, $3)
              `;
              await client.query(orderItemQuery, [
                orderId,
                product.id,
                product.quantity,
              ]);
            }

            await client.query("COMMIT");
          } catch (error) {
            await client.query("ROLLBACK");
            throw error;
          } finally {
            client.release();
          }

          res.status(201).json({
            message: "Order created successfully",
            order: {
              id: orderId,
              total_price: orderPrice,
            },
          });
        } catch (error) {
          console.error("Create order error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }

      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
