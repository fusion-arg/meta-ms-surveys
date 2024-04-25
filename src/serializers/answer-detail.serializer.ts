import { Survey } from '../modules/survey/entities/survey.entity';
import { BaseSerializer } from './base.serializer';

export class AnswerDetailSerializer extends BaseSerializer<Survey> {
  serialize(item: Survey): any {
    const questions = [];

    for (const question of item.questions) {
      const answer = question.answers[0];

      const item = {
        id: question.id,
        createdAt: question.createdAt.toISOString(),
        updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
        title: question.title,
        description: question.description,
        order: question.order,
        type: question.type,
        imageUrl: question.imageUrl,
        dropdownOptions: question.dropdownOptions,
        presentationLink: question.presentationLink,
        metadata: question.metadata,
        answer: {
          id: answer.id,
          createdAt: answer.createdAt.toISOString(),
          updatedAt: answer.updatedAt ? answer.updatedAt.toISOString() : null,
          respondedAt: answer.respondedAt
            ? answer.respondedAt.toISOString()
            : null,
          response: answer.response,
        },
      };

      questions.push(item);
    }

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
      stakeholder: item['stakeholder'],
      metadata: item.metadata,
      questions,
    };
  }
}
