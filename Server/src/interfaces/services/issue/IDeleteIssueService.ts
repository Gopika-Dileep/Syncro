export interface IDeleteIssueService {
  execute(issueId: string): Promise<void>;
}
