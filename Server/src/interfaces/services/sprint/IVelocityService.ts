import { VelocityAnalyticsResponse } from '../../../dto/sprint.dto';

export interface IVelocityService {
  getVelocityAnalytics(sprintId: string): Promise<VelocityAnalyticsResponse>;
}