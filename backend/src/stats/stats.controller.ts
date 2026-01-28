import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('dashboard')
  getDashboardStats(@Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day') {
    return this.statsService.getDashboardStats(period);
  }
}
