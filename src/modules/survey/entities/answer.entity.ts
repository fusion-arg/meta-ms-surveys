import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Question } from './question.entity';

@Entity()
export class Answer extends BaseEntity {
  @Column({ name: 'responded_at', nullable: true })
  respondedAt: Date;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'json' })
  response: string;
}
