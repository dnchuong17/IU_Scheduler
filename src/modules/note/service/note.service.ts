import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteEntity } from '../entity/note.entity';
import { Repository } from 'typeorm';
import { TracingLoggerService } from '../../../logger/tracing-logger.service';
import { NoteDto } from '../dto/note.dto';
import { ScheduleTemplateService } from '../../schedulerTemplate/service/scheduleTemplate.service';
import { CourseValueService } from '../../courseValue/service/courseValue.service';
import { CourseValueEntity } from '../../courseValue/entity/courseValue.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    private readonly logger: TracingLoggerService,
    private readonly courseValueService: CourseValueService,
  ) {}

  async getNoteById(id: number) {
    const note = await this.noteRepository.findOne({ where: { id: id } });
    if (!note) {
      this.logger.debug(`[FIND NOTE] can not find note with id: ${id}`);
      throw new NotFoundException();
    }
    return note;
  }

  async getNoteByCourseValueId(id: number): Promise<NoteEntity> {
    const note = await this.noteRepository.findOne({
      where: { courseValues: { id } },
    });
    if (!note) {
      this.logger.debug(
        `[FIND NOTE] fail to find note of course value with id: ${id}`,
      );
      throw new NotFoundException(
        'fail to find note of course value with id: ${id}',
      );
    }
    return note;
  }

  async createNote(noteDto: NoteDto) {
    const existingCourseValue = await this.courseValueService.getCourseValue(
      noteDto.courseValue.id,
    );
    if (!existingCourseValue) {
      this.logger.debug(
        `[FIND COURSE VALUE] can not find course value with id: ${noteDto.courseValue.id}`,
      );
      throw new NotFoundException('Can not find course value');
    }
    const newNote = await this.noteRepository.create({
      content: noteDto.content,
      courseValues: existingCourseValue,
    });
    this.logger.debug(
      `[CREATE DEFAULT NOTE] create new default note for course value with id: ${noteDto.courseValue.id}`,
    );
    await this.noteRepository.save(newNote);
    return newNote;
  }

  async updateNote(id: number, noteDto: NoteDto) {
    const existingNote = await this.getNoteByCourseValueId(id);

    const existingCourseValue = await this.courseValueService.getCourseValue(
      noteDto.courseValue.id,
    );

    existingNote.content = noteDto.content;
    existingNote.courseValues = existingCourseValue;
    await this.noteRepository.save(existingNote);
    this.logger.debug(
      `[UPDATE NOTE] successfully updating note with note id: ${existingNote.id}`,
    );
  }
}
