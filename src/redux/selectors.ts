import { ContentType, CourseInfo } from 'thu-learn-lib/lib/types';
import { DataState } from './reducers/data';
import { ContentInfo } from '../types/data';
import { CardListProps } from '../types/sidebar';

export function getCourseIdListForContent(data: DataState, contentType: ContentType) {
  const courseIDs = [...data.courseMap.keys()];
  return courseIDs.filter(id => !data.contentIgnore[id][contentType]);
}

let oldType: ContentType;
let oldCourse: CourseInfo;
let allContent: ContentInfo[];
let oldCards: ContentInfo[];
let lastRegenerateTime: Date;

export const generateCardList = (
  data: DataState,
  lastUpdateTime: Date,
  type?: ContentType,
  course?: CourseInfo,
): Partial<CardListProps> => {
  let newCards: ContentInfo[] = [];

  if (
    type === oldType &&
    course === oldCourse &&
    oldCards !== undefined &&
    lastRegenerateTime === lastUpdateTime
  ) {
    // filter and data not changed, use filtered & sorted sequence
    // just fetch the latest state
    newCards = oldCards.map(l => data[`${l.type}Map`].get(l.id));
  } else {
    // filter or data changed, re-calculate visibility and sequence

    if (lastUpdateTime !== lastRegenerateTime) {
      // data updated from network, generate data from scratch
      allContent = [];
      for (const k of Object.keys(data)) {
        if (k.startsWith('course') || !k.endsWith('Map')) continue;
        const source = data[k] as Map<string, ContentInfo>;
        for (const item of source.values()) {
          allContent.push(item);
        }
      }
      lastRegenerateTime = lastUpdateTime;
    }

    // fetch latest state of data
    newCards = allContent.map(l => data[`${l.type}Map`].get(l.id));
    if (type !== undefined) newCards = newCards.filter(l => l.type === type);
    if (course !== undefined) newCards = newCards.filter(l => l.courseId === course.id);

    // sort by starred, hasRead and time
    newCards.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      if (!a.hasRead && b.hasRead) return -1;
      if (a.hasRead && !b.hasRead) return 1;
      return b.date.getTime() - a.date.getTime();
    });
  }

  oldType = type;
  oldCourse = course;
  oldCards = newCards;
  return {
    contents: newCards,
  };
};
