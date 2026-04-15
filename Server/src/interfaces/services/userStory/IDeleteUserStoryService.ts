export interface IDeleteUserStoryService {
  execute(storyId: string): Promise<void>;
}
