import { CommunityProps } from "../../../domain/contexts/community/community";
import { SystemExecutionContext } from "../../../domain/infrastructure/execution-context";
import { InteractWithTheDomain } from "../domain/abilities/interactWithTheDomain";

export async function GetCommunityByName(communityName: string): Promise<CommunityProps> {
  let community: CommunityProps;
  await InteractWithTheDomain.using(SystemExecutionContext()).readCommunityDb(async (db) => {
    community = db?.getAll()?.find(c => c.name === communityName);
  });
  return community;
}
