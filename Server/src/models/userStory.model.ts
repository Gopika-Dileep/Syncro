import mongoose, { Schema, Document } from 'mongoose';
import { UserStoryStatus, UserStoryPriority } from '../enums/UserStoryEnums';

export interface IUserStory extends Document {
  project_id: mongoose.Types.ObjectId;
  title: string;
  criteria: string[];
  story_points: number;
  priority: UserStoryPriority;
  status: UserStoryStatus;
  created_at: Date;
  updated_at: Date;
}

const userStorySchema = new Schema<IUserStory>(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    criteria: [
      {
        type: String,
        required: true,
      },
    ],
    story_points: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(UserStoryPriority),
      required: true,
      default: UserStoryPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(UserStoryStatus),
      required: true,
      default: UserStoryStatus.NEW,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const userStoryModel = mongoose.model<IUserStory>('UserStory', userStorySchema);
