import {
  Notification,
  Homework,
  File,
  Discussion,
  Question,
  ContentType,
} from 'thu-learn-lib/lib/types';

interface ICourseRef {
  courseId: string;
  courseName: string;
}

interface ICardStatus {
  type: ContentType;
  id: string;
  date: Date;
  hasRead: boolean;
  starred: boolean;
}

type ICardData = ICourseRef & ICardStatus;

export type NotificationInfo = Notification & ICardData;
export type HomeworkInfo = Homework & ICardData;
export type FileInfo = File & ICardData;
export type DiscussionInfo = Discussion & ICardData;
export type QuestionInfo = Question & ICardData;

export type ContentInfo =
  | NotificationInfo
  | HomeworkInfo
  | FileInfo
  | DiscussionInfo
  | QuestionInfo;
