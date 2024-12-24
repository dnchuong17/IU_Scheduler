import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeadlineEntity } from '../entity/deadline.entity';
import { DeadlineDto } from '../dto/deadline.dto';
import { CourseValueService } from '../../courseValue/service/courseValue.service';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';

@Injectable()
export class DeadlineService {
  constructor(
    @InjectRepository(DeadlineEntity)
    private readonly deadlineRepository: Repository<DeadlineEntity>,
    private readonly dataSource: DataSource,
    private readonly courseValueService: CourseValueService,
    private readonly logger: TracingLoggerService,
  ) {
    this.logger.setContext(DeadlineService.name);
  }

  async createDeadline(deadlineDto: DeadlineDto) {
    const existCourseValue = await this.courseValueService.getCourseValue(
      deadlineDto.courseValueId,
    );

    if (!existCourseValue) {
      return {
        message: 'Course value not found',
        statusCode: 404,
      };
    }

    await this.deadlineRepository
      .createQueryBuilder()
      .insert()
      .into(DeadlineEntity)
      .values({
        isActive: deadlineDto.isActive,
        deadlineType: deadlineDto.deadlineType,
        priority: deadlineDto.priority,
        description: deadlineDto.description,
        deadline: new Date(deadlineDto.date),
        courseValue: existCourseValue,
      })
      .execute();

    return {
      message: 'Deadline created successfully',
    };
  }

  async getAllDeadline() {
    const query = 'SELECT * FROM deadline where is_Active = true';
    return await this.dataSource.query(query);
  }

  async activeAlert(isActive: boolean, id: number) {
    try {
      await this.deadlineRepository
        .createQueryBuilder()
        .update(DeadlineEntity)
        .set({
          isActive: isActive,
        })
        .where('id = :id', { id })
        .execute();
      if (isActive == true) {
        return 'turn on alert';
      }
      return 'turn off alert';
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getDeadlineByCoursealueId(courseValueId: number) {
    const deadlines = await this.deadlineRepository.query(
      `
    SELECT d.*
    FROM deadline d
    INNER JOIN course_value cv ON d."courseValueId" = cv.course_value_id
    WHERE cv.course_value_id = $1 AND d."is_Active" = true
    `,
      [courseValueId],
    );

    if (deadlines.length === 0) {
      this.logger.debug('[FIND DEADLINE] fail to find active deadlines');
      throw new NotFoundException('No active deadlines found');
    }

    this.logger.debug(
      `[FIND DEADLINE] found ${deadlines.length} active deadlines for course value id: ${courseValueId}`,
    );

    return {
      message: `Found ${deadlines.length} active deadlines successfully`,
      deadlines,
    };
  }
}
