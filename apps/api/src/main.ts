import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)

    // Global prefix
    app.setGlobalPrefix("api/v1")

    // Validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    // CORS
    app.enableCors()

    const port = process.env.PORT ?? 3000
    await app.listen(port)

    console.warn(`OpenNotify API running on http://localhost:${String(port)}/api/v1`)
}

void bootstrap()
