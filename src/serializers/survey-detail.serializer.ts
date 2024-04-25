import { Question } from '../modules/survey/entities/question.entity';
import { Survey } from '../modules/survey/entities/survey.entity';
import { BaseSerializer } from './base.serializer';

export class SurveyDetailSerializer extends BaseSerializer<Survey> {
  serialize(item: Survey): any {
    const questions = item.questions?.map((question: Question) => ({
      id: question.id,
      title: question.title,
      description: question.description,
      order: question.order,
      type: question.type,
      metadata: question.metadata,
      dropdownOptions: question.dropdownOptions,
    }));
    const sprint = item.sprintName
      ? {
          id: item.sprintId,
          name: item.sprintName,
        }
      : {};
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      module: item.module,
      type: item.type,
      status: item.status,
      deliveredAt: item.deliveredAt ? item.deliveredAt.toISOString() : null,
      closedAt: item.closedAt ? item.closedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
      sprint,
      responses: {
        answered: item.totalAnswered,
        total: item.totalExpected,
      },
      segmentation: item.segmentation,
      questions: questions,
    };
  }
}
