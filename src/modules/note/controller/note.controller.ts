import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NoteService } from '../service/note.service';
import { NoteDto } from '../dto/note.dto';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get(':id')
  getNoteById(@Param('id') id: number) {
    return this.noteService.getNoteById(+id);
  }
}
