import { Before, Given, When, Then, DataTable } from '@cucumber/cucumber';
import { Actor, actorInTheSpotlight, Check, notes, Question, List, TakeNotes, QuestionAdapter, AnswerQuestions, engage } from '@serenity-js/core';
import { actorCalled, Interaction } from '@serenity-js/core'
import { InteractWithTheDomain } from '../support/domain/abilities/interactWithTheDomain';
import { SystemExecutionContext } from '../../domain/infrastructure/execution-context';
import { v4 as uuidV4 } from 'uuid';
import { User, UserEntityReference, UserProps } from '../../domain/contexts/user/user';
import { Ensure, isTrue } from '@serenity-js/assertions';
import { ReadOnlyPassport } from '../../domain/contexts/iam/passport';
import { MemoryDatabase } from '../support/domain/adapter/infrastructure/persistance/memory-database';


Before(function () {
 
  this.community = {}
  this.user = {}
})


Given('{actor} creates community {word}', async function(actor: Actor, community: string){

  interface CreateCommunityNotes{
    newUser: User<UserProps>;
    allUsers: UserProps[];
  }

  const givenUserData = {
    externalId:  uuidV4(),
    firstName: 'John',
    lastName: 'Doe'
  }
  
  const givenUserData2 = {
    externalId:  uuidV4(),
    firstName: 'Billy',
    lastName: 'Bob'
  }

  const UserListContainsUser = (externalId:string) =>
    Question.about('User list contains user', async (actor) => {
      let userResult: UserProps;
      await InteractWithTheDomain.as(actor).readUserDb(async (db) => {
        const users = db.getAll();
        userResult = users.find((user) => user.externalId === externalId);
      });
       return userResult !== undefined;
    });

    const CreatedUser = (externalId:string) =>
    Question.about('User list contains user', async (actor) => {
      let userResult: UserProps;
      await InteractWithTheDomain.as(actor).readUserDb(async (db) => {
        const users = db.getAll();
        userResult = users.find((user) => user.externalId === externalId);
      });
       return userResult;
    });

    const AllUsers = () =>
    Question.about('User list contains user', async (actor) => {
      let userResult: UserProps[];
      await InteractWithTheDomain.as(actor).readUserDb(async (db) => {
        userResult = db.getAll();
      });
       return userResult;
    });
   

  await actorCalled(actor.name)
    .whoCan(
      TakeNotes.usingAnEmptyNotepad(),
      InteractWithTheDomain.using(SystemExecutionContext())
      )
    .attemptsTo(
      createUser(givenUserData.externalId, givenUserData.firstName, givenUserData.lastName),
      Ensure.that(UserListContainsUser(givenUserData.externalId), isTrue()),
   
      notes<CreateCommunityNotes>().set('allUsers', AllUsers()),
      
      createCommunity(community,givenUserData.externalId, notes<CreateCommunityNotes>().get('allUsers')),
    )

    await actorCalled(actor.name)
    .whoCan(
      TakeNotes.usingAnEmptyNotepad(),
      InteractWithTheDomain.using(SystemExecutionContext())
      )
    .attemptsTo(
      createUser(givenUserData2.externalId, givenUserData2.firstName, givenUserData2.lastName),
      Ensure.that(UserListContainsUser(givenUserData2.externalId), isTrue()),
   
      notes<CreateCommunityNotes>().set('allUsers', AllUsers()),
      
      createCommunity(community,givenUserData2.externalId, notes<CreateCommunityNotes>().get('allUsers')),
      
    )

      
});

export const createUser = (externalId:string, firstName:string, lastName:string) => {
  return Interaction.where(`#actor creates user`, async (actor:Actor) => {
    await InteractWithTheDomain.as(actor).actOnUser(async (repo) => {
      const user = await repo.getNewInstance(externalId, firstName, lastName);
      await repo.save(user);
    });
  });
}

export const createCommunity = (communityName: string, externalId:string, users: QuestionAdapter<UserProps[]>) => {
  return Interaction.where(`#actor creates community`, async (actor:Actor) => {
    await InteractWithTheDomain.as(actor).actOnCommunity(async (repo) => {
      var userResult = await users.answeredBy(actor);
    
      var matchedUser = userResult.find((user) => user.externalId === externalId);
      // console.log('===>communityUser: ', userResult);
      let community = await repo.getNewInstance(communityName, matchedUser);
      // console.log('===>community: ', community);
      // community.Domain = 'test.com';
      // console.log('===>updated community: ', community);
      await repo.save(community);
    });

    // Interaction to ClearLocalStorage directly uses Actor's ability to BrowseTheWeb
    // const page: Page = await BrowseTheWeb.as(actor).currentPage()
    // await page.executeScript(() => window.localStorage.clear())
    // console.log('===>createCommunity: ', communityName)
  });
}