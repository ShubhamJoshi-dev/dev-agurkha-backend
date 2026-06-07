import { PartialType } from '@nestjs/swagger';
import { CreateBannerCategoryDto } from './create-banner-category.dto';

export class UpdateBannerCategoryDto extends PartialType(CreateBannerCategoryDto) {}
