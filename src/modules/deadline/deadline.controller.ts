import { DeadlineService } from './deadline.service';

export class DeadlineController {
  constructor(private readonly deadlineService: DeadlineService) {
  }
}