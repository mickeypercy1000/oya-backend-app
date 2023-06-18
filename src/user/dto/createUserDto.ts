import { IsDate, IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    birthdate: string;

    @IsString()
    password: string;

}