import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteEntity } from '../entity/note.entity';
import { Repository } from 'typeorm';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { NoteDto } from '../dto/note.dto';
import { ScheduleTemplateService } from '../../schedulerTemplate/service/scheduleTemplate.service';
import { CourseValueService } from '../../courseValue/service/courseValue.service';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    private readonly logger: TracingLoggerService,
    private readonly scheduleTemplateService: ScheduleTemplateService,
    private readonly courseValueService: CourseValueService,
  ) {}

  async getNoteById(id: number) {
    const note = await this.noteRepository.findOne({ where: { id: id } });
    return note;
  }
}
