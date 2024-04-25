import { BaseSerializer } from './base.serializer';

export class AnswerSerializer extends BaseSerializer<any> {
  serialize(item: any): any {
    return {
      id: item.id,
      name: item.name,
      lastAnswerAt: item.lastAnswerAt?.toISOString(),
      departments: item.departments,
      projectRole: item.projectRole,
      positions: item.positions,
      influencerTypes: item.influencers,
    };
  }
}
