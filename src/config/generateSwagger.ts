import { writeFileSync } from "fs";
import { swaggerOptions } from "./swagger";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const outputPath = path.resolve(__dirname, "../swagger.json");

const freshDocs = swaggerJsdoc(swaggerOptions);
writeFileSync(outputPath, JSON.stringify(freshDocs, null, 2));

console.log(`Swagger documentation generated at ${outputPath}`);
