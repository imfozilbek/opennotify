import { Controller, Get } from "@nestjs/common"

interface HealthResponse {
    status: "ok"
    timestamp: string
    version: string
}

@Controller("health")
export class HealthController {
    @Get()
    check(): HealthResponse {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            version: "0.1.0",
        }
    }
}
