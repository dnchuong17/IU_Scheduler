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
import { UserService } from "../../user/service/user.service";

@Injectable()
export class DeadlineService {
  constructor(
    @InjectRepository(DeadlineEntity)
    private readonly deadlineRepository: Repository<DeadlineEntity>,
    private readonly dataSource: DataSource,
    private readonly courseValueService: CourseValueService,
    private readonly logger: TracingLoggerService,
    private readonly userService: UserService
  ) {
    this.logger.setContext(DeadlineService.name);
  }

  async createDeadline(deadlineDto: DeadlineDto) {
    await this.deadlineRepository
      .createQueryBuilder()
      .insert()
      .into(DeadlineEntity)
      .values({
        isActive: deadlineDto.isActive ?? false,
        deadlineType: deadlineDto.deadlineType,
        priority: deadlineDto.priority || null,
        description: deadlineDto.description,
        deadline: new Date(deadlineDto.date),
        courseValue: deadlineDto.courseValue,
        user: deadlineDto.user,
      })
      .execute();

    return {
      message: 'Deadline created successfully',
      statusCode: 201,
    };
  }

  async getAllDeadlineByUId(userId: number) {
    const query = 'SELECT "UID" FROM deadline WHERE "userId" = $1';
    const deadlineIds = await this.dataSource.query(query, [userId]);
    return {
      message: 'Deadlines retrieved successfully',
      data: {
        UIDs: deadlineIds.map((deadline) => deadline.UID),
      },
    };
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
