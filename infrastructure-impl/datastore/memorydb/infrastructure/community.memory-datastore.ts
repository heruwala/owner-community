import { CommunityDatastoreInfrastructureService } from '../../../../infrastructure-services/datastore';
import { CommunityDataStructure } from '../../data-structures/community';
import { BaseMemoryDatastore } from './_base.memory-datastore';
import { ReadOnlyMemoryStore } from '../../../../services-seedwork-datastore-memorydb/infrastructure/memory-store';

type PropType = CommunityDataStructure;

export class MemoryCommunityDatastore 
  extends BaseMemoryDatastore<PropType>
  implements CommunityDatastoreInfrastructureService {

  private _memoryStore: ReadOnlyMemoryStore<PropType>;

  constructor(memoryStore: ReadOnlyMemoryStore<PropType>){
    super(memoryStore);
    this._memoryStore = memoryStore;
  }

  async getCommunityByHeader(header: string): Promise<CommunityDataStructure> {
    return (await this._memoryStore.getAll())?.
      find(r => r.handle === header || r.domain === header || r.whiteLabelDomain === header)?.[0];
  }
  
  async isUserAdmin(communityId: string, externalId: string): Promise<boolean> {
    return true;  // [MG-TBD]: implement this
  }

  async getCommunitiesForUser(externalId: string): Promise<CommunityDataStructure[]> {
    return (await this._memoryStore.getAll()); // [MG-TBD]: implement this
  }
}