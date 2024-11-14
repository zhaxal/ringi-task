import type { NextApiRequest, NextApiResponse } from "next";
import pool from "@/database";
import { Auth } from "googleapis";

class OrderError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "OrderError";
  }
}

async function sendOrderNotifications(orderId: number, orderPrice: number) {
  try {
    const sellerTokensResult = await pool.query(`
      SELECT DISTINCT uf.fcm_token 
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON r.id = ur.role_id
      JOIN user_fcm uf ON u.id = uf.user_id
      WHERE r.name = 'seller'
      AND uf.fcm_token IS NOT NULL
    `);

    const sellerTokens = sellerTokensResult.rows.map((row) => row.fcm_token);

    const credential = JSON.parse(
      Buffer.from(process.env?.FIREBASE_SERVER_KEY ?? "", "base64").toString()
    );

    const jwtClient = new Auth.JWT(
      credential.client_email,
      undefined,
      credential.private_key,
      ["https://www.googleapis.com/auth/firebase.messaging"],
      undefined
    );

    const oauthToken = await jwtClient.authorize();

    await Promise.allSettled(
      sellerTokens.map((token) =>
        fetch(
          `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${oauthToken.access_token}`,
            },
            body: JSON.stringify({
              message: {
                token,
                notification: {
                  title: "New order received",
                  body: `Order #${orderId} for $${orderPrice.toFixed(2)}`,
                },
              },
            }),
          }
        )
      )
    );
  } catch (error) {
    console.error("Notification error:", error);
  }
}

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
          let orderId = 0;

          try {
            await client.query("BEGIN");

            const productValidations = await Promise.all(
              products.map(async (product) => {
                const result = await client.query(
                  `SELECT id, price, stock FROM products WHERE id = $1 FOR UPDATE`,
                  [product.id]
                );

                if (result.rows.length === 0) {
                  throw new OrderError(`Product ${product.id} not found`, 404);
                }

                const { price, stock } = result.rows[0];
                if (stock < product.quantity) {
                  throw new OrderError(
                    `Insufficient stock for product ${product.id}: requested ${product.quantity}, available ${stock}`,
                    400
                  );
                }

                return {
                  id: product.id,
                  price,
                  requestedQuantity: product.quantity,
                  currentStock: stock,
                };
              })
            );

            // Calculate total price and update stock
            for (const validation of productValidations) {
              orderPrice += validation.price * validation.requestedQuantity;

              const finalQuantity =
                validation.currentStock - validation.requestedQuantity;
              await client.query(
                `UPDATE products SET stock = $1 WHERE id = $2`,
                [finalQuantity, validation.id]
              );

              if (finalQuantity < 5) {
                console.warn(
                  `Low stock alert: Product ${validation.id} has ${finalQuantity} units remaining`
                );
              }
            }

            // Create order
            const orderResult = await client.query(
              `INSERT INTO orders (
                customer_name, customer_email, customer_phone, 
                status, total_price
              ) VALUES ($1, $2, $3, 'pending', $4)
              RETURNING id`,
              [customerName, customerEmail, customerPhone, orderPrice]
            );

            orderId = orderResult.rows[0].id;

            await Promise.all(
              products.map((product) =>
                client.query(
                  `INSERT INTO order_items (order_id, product_id, quantity)
                   VALUES ($1, $2, $3)`,
                  [orderId, product.id, product.quantity]
                )
              )
            );

            await client.query("COMMIT");

            res.status(200).json({
              message: "Order created successfully",
              order: {
                id: orderId,
                total_price: orderPrice,
                items: products.map((p) => ({
                  product_id: p.id,
                  quantity: p.quantity,
                })),
              },
            });

            sendOrderNotifications(orderId, orderPrice).catch(console.error);
          } catch (error) {
            await client.query("ROLLBACK");

            if (error instanceof OrderError) {
              return res.status(error.statusCode).json({
                message: error.message,
              });
            }
            throw error;
          } finally {
            client.release();
          }
        } catch (error) {
          console.error("Create order error:", error);
          res.status(500).json({
            message:
              error instanceof Error ? error.message : "Internal Server Error",
          });
        }
      }

      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;
