
import { Application } from "@/types/planning";

export type SearchCoordinates = [number, number] | null;

export interface SearchError extends Error {
  name: string;
  message: string;
}

export interface SearchResult {
  applications: Application[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  executionTime: number;
}

export type SearchType = 'location' | 'text';
