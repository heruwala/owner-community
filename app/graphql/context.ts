import { Passport } from '../core/domain/contexts/iam/passport';
import { HttpRequest } from '@azure/functions';
import { PassportContext } from './init/extensions/passport-context';
import { InfrastructureServicesBuilder } from '../startup/infrastructure-services-builder';
import { DataSourceBuilder } from './data-sources/data-source-builder';
import { DomainExecutionContext } from '../core/domain/contexts/domain-execution-context';
import { PortalTokenValidation } from '../auth/portal-token-validation';

export class Context implements DomainExecutionContext{
  public verifiedUser: {
    verifiedJWT: any;
    openIdConfigKey: string;
  };
  public community: string;
  public passport: Passport;
  public dataSources: DataSourceBuilder;
  public executionContext: any;
  public services: InfrastructureServicesBuilder;

  public async init(
    req: HttpRequest, 
    portalTokenValidator: PortalTokenValidation,
    applicationServices: DataSourceBuilder,
    infrastructureServices: InfrastructureServicesBuilder
    ) {
    this.services = infrastructureServices;
    this.dataSources = applicationServices;

    await PassportContext.decorateContext(this, req, portalTokenValidator);

    req.headers.set('x-ms-privatelink-id', ''); // https://github.com/Azure/azure-functions-host/issues/6013
    req.headers.set('server', null); //hide microsoft server header
  }
}
