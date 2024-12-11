import {Controller, Get, Param} from '@nestjs/common';
import { NoteService } from '../service/note.service';
import {NoteDto} from "../dto/note.dto";

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get(':id')
  getNoteByNoteId(@Param('id') id: number,noteDto: NoteDto) {
      return this.noteService.getNoteByNoteId(id, noteDto);
  }
}
