import { writeFileSync } from "fs";
import { swaggerDocs } from "./swagger";
import path from "path";

const outputPath = path.resolve(__dirname, "../swagger.json");

writeFileSync(outputPath, JSON.stringify(swaggerDocs, null, 2));

console.log(`Swagger documentation generated at ${outputPath}`);
