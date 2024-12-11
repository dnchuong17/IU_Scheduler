import { Module } from '@nestjs/common';
import { NoteController } from './controller/note.controller';
import { NoteService } from './service/note.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteEntity } from './entity/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity])],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
