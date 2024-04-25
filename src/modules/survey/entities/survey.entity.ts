import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Status } from '../../../enums/status.enum';
import { Question } from './question.entity';
import { SurveyType } from '../../../enums/survey-type.enum';
import { UserSurvey } from './user-survey.entity';
import { SurveyModule } from '../../../enums/survey-module.enum';

@Entity()
export class Survey extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'sprint_id', nullable: true })
  sprintId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column()
  status: Status;

  @Column()
  type: SurveyType;

  @Column()
  module: SurveyModule;

  @Column({ type: 'json' })
  metadata: string;

  @Column({ type: 'json' })
  segmentation: string;

  @OneToMany(() => Question, (question) => question.survey, {
    eager: false,
  })
  questions: Question[];

  @OneToMany(() => UserSurvey, (user) => user.survey, {
    eager: false,
  })
  users: UserSurvey[];

  @Column({ name: 'total_answered', default: 0 })
  totalAnswered: number;

  @Column({ name: 'total_expected', default: 0 })
  totalExpected: number;

  sprintName: string;
}
