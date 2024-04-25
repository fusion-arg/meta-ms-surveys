import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Survey } from './survey.entity';
import { QuestionType } from '../../../enums/question-type.enum';
import { Answer } from './answer.entity';

@Entity()
export class Question extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  order: number;

  @Column()
  type: QuestionType;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'dropdown_options', type: 'json', nullable: true })
  dropdownOptions: string;

  @Column({ name: 'presentation_link', nullable: true })
  presentationLink: string;

  @ManyToOne(() => Survey, (survey) => survey.questions)
  survey: Survey;

  @OneToMany(() => Answer, (answer) => answer.question, {
    eager: false,
  })
  answers: Answer[];

  @Column({ type: 'json' })
  metadata: string;
}
