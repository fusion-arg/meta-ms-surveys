import { Survey } from '../modules/survey/entities/survey.entity';
import { BaseSerializer } from './base.serializer';

export class SurveySerializer extends BaseSerializer<Survey> {
  serialize(item: Survey): any {
    return {
      id: item.id,
      type: item.type,
      status: item.status,
      deliveredAt: item.deliveredAt ? item.deliveredAt.toISOString() : null,
      closedAt: item.closedAt ? item.closedAt.toISOString() : null,
      title: item.title,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
      responses: {
        answered: item.totalAnswered,
        total: item.totalExpected,
      },
    };
  }
}
