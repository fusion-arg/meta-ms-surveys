import { Survey } from '../modules/survey/entities/survey.entity';
import { SurveyDetailSerializer } from './survey-detail.serializer';

export class SurveyDetailResponseSerializer extends SurveyDetailSerializer {
  serialize(item: Survey): any {
    const baseSerializedData = super.serialize(item);
    const questionsWithResponses = item.questions.map((question) => {
      const { answers, ...restQuestion } = question;
      const answer =
        answers && answers.length > 0
          ? {
              id: answers[0].id,
              respondedAt: answers[0].respondedAt,
              response: answers[0].response,
            }
          : null;

      return { ...restQuestion, answer };
    });

    const serializedDataWithResponses = {
      ...baseSerializedData,
      questions: questionsWithResponses,
    };

    return serializedDataWithResponses;
  }
}
