import { DataSource } from '../data-source';
import { Context as GraphQLContext } from '../../context';
import { Passport } from '../../../domain/contexts/iam/passport';
import { IVercel } from '../../../infrastructure/services/vercel';

export class VercelDataSource<Context extends GraphQLContext> extends DataSource<Context> {
  private _context: Context;
  private _vercel: IVercel;

  constructor(vercel: IVercel) {
    super();
    this._vercel = vercel;
  }
  
  public get context(): Context { return this._context;}

  public async withVercel(func:(passport:Passport, vercel:IVercel) => Promise<void>): Promise<void> {
    let passport =  this.context.passport; 
    await func(passport, this._vercel);
  }

  public initialize(context: Context): void {
    this._context = context;  
  }  
}