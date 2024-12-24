import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
import { NoteService } from '../service/note.service';
import { NoteDto } from '../dto/note.dto';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get(':courseValueId')
  getNoteById(@Param('courseValueId') courseValueId: number) {
    return this.noteService.getNoteById(+courseValueId);
  }

  @Patch('update')
  updateNote(@Body() noteDto: NoteDto) {
    return this.noteService.updateNote(noteDto);
  }
}
