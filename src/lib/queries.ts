import { queryOptions } from "@tanstack/react-query";
import {
  getSettings,
  getNews,
  getNewsItem,
  getGuides,
  getGuide,
  getDocuments,
  getMeetings,
  getMeeting,
  getStandItems,
} from "./public-data.functions";

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: () => getSettings(),
  staleTime: 60_000,
});

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: () => getNews(),
  staleTime: 60_000,
});

export const newsItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["news", slug],
    queryFn: () => getNewsItem({ data: { slug } }),
    staleTime: 60_000,
  });

export const guidesQuery = queryOptions({
  queryKey: ["guides"],
  queryFn: () => getGuides(),
  staleTime: 60_000,
});

export const guideQuery = (slug: string) =>
  queryOptions({
    queryKey: ["guide", slug],
    queryFn: () => getGuide({ data: { slug } }),
    staleTime: 60_000,
  });

export const documentsQuery = queryOptions({
  queryKey: ["documents"],
  queryFn: () => getDocuments(),
  staleTime: 60_000,
});

export const meetingsQuery = queryOptions({
  queryKey: ["meetings"],
  queryFn: () => getMeetings(),
  staleTime: 60_000,
});

export const meetingQuery = (slug: string) =>
  queryOptions({
    queryKey: ["meeting", slug],
    queryFn: () => getMeeting({ data: { slug } }),
    staleTime: 60_000,
  });

export const standQuery = queryOptions({
  queryKey: ["stand"],
  queryFn: () => getStandItems(),
  staleTime: 60_000,
});
