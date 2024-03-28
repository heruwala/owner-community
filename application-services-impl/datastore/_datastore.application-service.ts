import { BaseApplicationService, BaseApplicationServiceExecutionContext } from "../_base.application-service";
import { Passport } from "../../domain/contexts/iam/passport";
import { DatastoreInfrastructureService } from "../../infrastructure-services/datastore";

export class DatastoreApplicationServiceImpl<Context extends BaseApplicationServiceExecutionContext> extends BaseApplicationService<Context> {

  public async withDatastore(func: (passport: Passport, datastore: DatastoreInfrastructureService) => Promise<void>): Promise<void> {
    await func(
      this._context.passport, 
      this._context.infrastructureServices.datastore
    );
  }
}