import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator"

export class SendOtpDto {
    @IsString()
    phone: string

    @IsOptional()
    @IsNumber()
    @Min(4)
    @Max(8)
    codeLength?: number

    @IsOptional()
    @IsNumber()
    @Min(60)
    @Max(600)
    expiresInSeconds?: number

    @IsOptional()
    @IsString()
    messageTemplate?: string
}

export class VerifyOtpDto {
    @IsString()
    phone: string

    @IsString()
    code: string
}
