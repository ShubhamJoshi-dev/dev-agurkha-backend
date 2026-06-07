import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Testimonials')
@Controller({ path: 'testimonials', version: '1' })
export class TestimonialsController {
  constructor(private readonly svc: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'List testimonials (public)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Post()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create testimonial (admin)' })
  create(@Body() dto: CreateTestimonialDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update testimonial (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('bulk-delete')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.svc.bulkDelete(dto);
  }
}
