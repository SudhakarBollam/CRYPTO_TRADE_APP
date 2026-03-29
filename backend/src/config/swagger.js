const swaggerJsdoc = require("swagger-jsdoc");
const { loadConfig } = require("./index");

const { port } = loadConfig();

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Crypto Portfolio & Trade Intelligence API",
      version: "1.0.0",
      description:
        "REST API for crypto trade journaling, portfolio views, role-based access, and analyst analytics. JWT Bearer auth.",
    },
    servers: [{ url: `http://localhost:${port}`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["user", "admin", "analyst"] },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: { $ref: "#/components/schemas/UserPublic" },
              },
            },
          },
        },
        Trade: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { $ref: "#/components/schemas/UserPublic" },
            asset: { type: "string", example: "BTC" },
            type: { type: "string", enum: ["BUY", "SELL"] },
            price: { type: "number" },
            quantity: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
            note: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TradeInput: {
          type: "object",
          required: ["asset", "type", "price", "quantity"],
          properties: {
            asset: { type: "string", example: "ETH" },
            type: { type: "string", enum: ["BUY", "SELL"] },
            price: { type: "number", example: 3200.5 },
            quantity: { type: "number", example: 0.25 },
            timestamp: { type: "string", format: "date-time" },
            note: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/app.js"],
};

module.exports = swaggerJsdoc(options);
