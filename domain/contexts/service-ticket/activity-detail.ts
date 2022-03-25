import { Entity, EntityProps } from '../../shared/entity';
import { DomainExecutionContext } from '../context';
import { ServiceTicketVisa } from '../iam/service-ticket-visa';
import { User, UserEntityReference, UserProps } from '../user/user';
import * as ValueObjects from './activity-detail-value-objects';

export interface ActivityDetailPropValues extends EntityProps {
  activityType: string;
  activityDescription: string;
  readonly activityBy: UserProps;
  setActivityByRef: (activityBy: UserProps) => void;
}

export interface ActivityDetailProps extends ActivityDetailPropValues {}

export interface ActivityDetailEntityReference extends Readonly<Omit<ActivityDetailPropValues,
  'activityBy' | 'setActivityByRef'>> {
  readonly activityBy: UserEntityReference;
}

export class ActivityDetail extends Entity<ActivityDetailProps> implements ActivityDetailEntityReference {
  constructor(
    props: ActivityDetailProps, 
    private context: DomainExecutionContext,
    private readonly visa: ServiceTicketVisa) { super(props); }

  get activityType(){return this.props.activityType;}
  get activityDescription(){return this.props.activityDescription;}
  get activityBy(): UserEntityReference {return new User(this.props.activityBy,this.context);}

  requestSetActivityType(activityTypeCode: ValueObjects.ActivityTypeCode) {
    this.props.activityType = activityTypeCode.valueOf();
  }
  requestSetActivityDescription(activityDescription: ValueObjects.Description) {
    this.props.activityDescription = activityDescription.valueOf();
  }
  requestSetActivityBy(activityBy: UserEntityReference) {
    this.props.setActivityByRef(activityBy);
  }

}