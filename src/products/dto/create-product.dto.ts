import { Type } from "class-transformer";
import { IsString, Min } from "class-validator";

import { IsNumber } from "class-validator";

export class CreateProductDto {

    @IsString()
    public name: string;

    @IsNumber({
        maxDecimalPlaces: 4,
    })
    @Min(0)
    @Type(() => Number)
    public price: number;

}
