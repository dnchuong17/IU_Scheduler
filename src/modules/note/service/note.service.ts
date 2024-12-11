import { Injectable } from '@nestjs/common';
import { NoteDto } from '../dto/note.dto';

@Injectable()
export class NoteService {
  async getNoteByNoteId(id: number,noteDto: NoteDto): Promise<NoteDto> {
    return null;
  }
}
