import { SearchIndexClient, SearchClient, AzureKeyCredential, SearchIndex, SearchOptions, SearchDocumentsResult } from '@azure/search-documents';

export class CognitiveSearch {
  private readonly searchKeyEnvVar = 'SEARCH_API_KEY';
  private readonly endpointEnvVar = 'SEARCH_API_ENDPOINT';
  private client: SearchIndexClient;
  private searchClients: Map<string, SearchClient<unknown>> = new Map<string, SearchClient<unknown>>();

  tryGetEnvVar(envVar: string): string {
    const value = process.env[envVar];
    if (value === undefined) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
    return value;
  }

  constructor() {
    const credentials = new AzureKeyCredential(this.tryGetEnvVar(this.searchKeyEnvVar));
    const endpoint = this.tryGetEnvVar(this.endpointEnvVar);
    this.client = new SearchIndexClient(endpoint, credentials);
  }

  async createIndexIfNotExists(indexName: string, indexDefinition: SearchIndex): Promise<void> {
    if (this.searchClients.has(indexName)) return;
    await this.client
      .getIndex(indexName)
      .then((index) => {
        console.log(`Index ${indexName} already exists`);

        return index;
      })
      .catch((err) => {
        console.log(`Index ${indexName} does not exist error ${JSON.stringify(err)} thrown, creating it...`);
        return this.client.createIndex(indexDefinition);
      });
    this.searchClients.set(indexName, this.client.getSearchClient(indexName));
  }

  async createOrUpdateIndex(indexName: string, indexDefinition: SearchIndex): Promise<void> {
    if (this.searchClients.has(indexName)) return;
    await this.client
      .getIndex(indexName)
      .then(() => {
        console.log(`Index ${indexName} already exists`);
        return this.client.createOrUpdateIndex(indexDefinition);
      })
      .catch((err) => {
        console.log(`Index ${indexName} does not exist error ${JSON.stringify(err)} thrown, creating it...`);
        return this.client.createOrUpdateIndex(indexDefinition);
      });
    this.searchClients.set(indexName, this.client.getSearchClient(indexName));
  }

  async search(indexName: string, searchText: string, options?: any): Promise<SearchDocumentsResult<Pick<unknown, never>>> {
    var result = await this.client.getSearchClient(indexName).search(searchText, options);
    console.log('search result', result);
    return result;
  }

  async deleteDocument(indexName: string, document: any): Promise<void> {
    await this.client.getSearchClient(indexName).deleteDocuments([document]);
  }

  async indexDocument(indexName: string, document: any): Promise<void> {
    //return this.searchClients.get(indexName)!.indexDocuments([document]);
    let searchClient = this.searchClients.get(indexName);

    searchClient.mergeOrUploadDocuments([document]);
  }

  // async updateIndex(indexName: string) {
  //   const index = await this.client.getIndex(indexName);
  //   this.client.createOrUpdateIndex(index);
  // }
}
