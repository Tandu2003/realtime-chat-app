import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  profilePicture?: string;
}
