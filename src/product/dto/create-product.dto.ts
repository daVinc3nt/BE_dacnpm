import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsDecimal, IsInt, IsOptional, IsString, IsUUID, Min, IsIn } from 'class-validator';

export class CreateProductDto {
    @IsString()
    Name: string;

    @IsBoolean()
    MakeFlag: boolean;

    @IsBoolean()
    FinishedGoodsFlag: boolean;

    @IsString()
    Color: string;


    @Min(0.01) // SafetyStockLevel must be greater than 0
    SafetyStockLevel: number;


    @Min(0.01) // ReorderPoint must be greater than 0
    ReorderPoint: number;

    @Min(0) // StandardCost must be greater than or equal to 0
    StandardCost: number;

    @Min(0) // ListPrice must be greater than or equal to 0
    ListPrice: number;

    @IsString()
    Size: string;

    @IsString()
    SizeUnitMeasureCode: string;

    @IsString()
    WeightUnitMeasureCode: string;

    @Min(0) // Weight must be greater than 0
    Weight: number;

    @IsInt()
    @Min(0) // DaysToManufacture must be greater than or equal to 0
    DaysToManufacture: number;

    @IsOptional() // ProductLine can be null
    @IsString()
    @IsIn(['R', 'M', 'T', 'S'], { message: 'ProductLine must be one of R, M, T, S or NULL.' })
    ProductLine?: string;

    @IsOptional() // Class can be null
    @IsString()
    @IsIn(['H', 'M', 'L'], { message: 'Class must be one of H, M, L or NULL.' })
    Class?: string;

    @IsOptional() // Style can be null
    @IsString()
    @IsIn(['U', 'M', 'W'], { message: 'Style must be one of U, M, W or NULL.' })
    Style?: string;

    @IsOptional()
    @IsInt()
    ProductSubcategoryID: number;

    @IsOptional()
    @IsInt()
    ProductModelID: number;

    @IsDate()
    @Type(() => Date)
    SellStartDate: Date;

    @IsOptional() // SellEndDate can be null
    @IsDate()
    @Type(() => Date)
    SellEndDate?: Date;

    @IsOptional() // DiscontinuedDate can be null
    @IsDate()
    @Type(() => Date)
    DiscontinuedDate?: Date;


    @IsDate()
    @Type(() => Date)
    ModifiedDate: Date; // This field will typically be set to the current timestamp on insert
}
