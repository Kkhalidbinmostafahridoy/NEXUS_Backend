import "dotenv/config";
import app from "./app";
import { prisma } from "./shared/prisma";
const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => console.log(`NEXUS Express API listening on :${port}`));
const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
