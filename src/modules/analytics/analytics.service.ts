import { Injectable } from '@nestjs/common';
import { ContactService } from '../contact/contact.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly contactService: ContactService) {}

  async getSummary() {
    const messagesByMonth = await this.contactService.countByMonth();

    return {
      pageViews: {
        total: 0,
        byDay: [] as { date: string; views: number }[],
      },
      messagesByMonth,
    };
  }
}
