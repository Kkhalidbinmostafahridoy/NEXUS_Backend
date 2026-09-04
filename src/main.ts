import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { addNexusApiPaths } from "./config/openapi";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix("api/v1", { exclude: ["health", "health/live", "health/ready"] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  const document = addNexusApiPaths(
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle("NEXUS API").setVersion("v1").addBearerAuth().build(),
    ),
  );
  SwaggerModule.setup("docs", app, document);
  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
