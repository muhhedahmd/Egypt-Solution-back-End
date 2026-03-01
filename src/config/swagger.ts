import swaggerJsdoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Landing Manager API",
      version: "1.0.0",
      description: "API Documentation for the Landing Manager Backend",
    },
    servers: [
      {
        url: "https://egypt-solution-back-end.vercel.app",
        description: "Production Server",
      },
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        cookieAuth: [],
      },
    ],
  },
  // Look for swagger definitions in routing, controller, and dedicated documentation YAML files
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./src/docs/swagger/*.yaml",
  ],
};

// Use pre-generated JSON to bypass Vercel stripping comments during build
let swaggerDocs = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  swaggerDocs = require("../swagger.json");
} catch (e) {
  // Fallback to dynamic generation if the json isn't generated yet (e.g. dev mode)
  swaggerDocs = swaggerJsdoc(swaggerOptions);
}

export { swaggerDocs };
