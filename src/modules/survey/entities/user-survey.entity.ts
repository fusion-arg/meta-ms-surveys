import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Survey } from './survey.entity';

@Entity()
export class UserSurvey extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Survey, (survey) => survey.users)
  survey: Survey;

  @Column({ default: false })
  responded: boolean;
}
