import { PartialType } from '@nestjs/swagger';
import { CreateDownloadGroupDto } from './create-download-group.dto';

export class UpdateDownloadGroupDto extends PartialType(CreateDownloadGroupDto) {}
