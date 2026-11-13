/*
api.ts
*/

import { API_CONFIG } from './config';
import { PaginatedResponse, SongDetail, PlaceMapping } from './types';

type SongSearchParams = {
  q?: string;
  place?: string;
  raga?: string;
  thala?: string;
  chandam?: string;
  number?: string | number;
  page?: number;
  limit?: number;
};

/**
 * Generic helper function to handle API requests and response errors
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    // No default headers: a GET with Content-Type forces a CORS preflight (BUG-10).
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API Error [${response.status}]: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch from endpoint: ${endpoint}`, error);
    throw error;
  }
}

const appendIfValue = (query: URLSearchParams, key: string, value: unknown) => {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    query.append(key, String(value).trim());
  }
};

/**
 * Fetch songs with search and filter parameters
 */
export async function fetchSongs(params: SongSearchParams = {}): Promise<PaginatedResponse> {
  const query = new URLSearchParams();

  appendIfValue(query, 'q', params.q);
  appendIfValue(query, 'place', params.place);
  appendIfValue(query, 'raga', params.raga);
  appendIfValue(query, 'thala', params.thala);
  appendIfValue(query, 'chandam', params.chandam);
  appendIfValue(query, 'number', params.number);

  query.append('page', String(params.page || 1));
  query.append('limit', String(params.limit || API_CONFIG.DEFAULT_LIMIT));

  return apiFetch<PaginatedResponse>(`/songs?${query.toString()}`);
}

/**
 * Fetch details and full lyrics for a single song
 */
export async function fetchSongDetail(songNumber: number): Promise<SongDetail> {
  return apiFetch<SongDetail>(`/songs/${songNumber}`);
}

/**
 * Fetch a completely random Thiruppugazh song
 */
export async function fetchRandomSong(): Promise<SongDetail> {
  return apiFetch<SongDetail>('/random-song');
}

/**
 * Fetch all unique places/temples and their song mappings
 */
export async function fetchPlaces(): Promise<PlaceMapping[]> {
  return apiFetch<PlaceMapping[]>('/places');
}

/**
 * Fetch list of all distinct ragas
 */
export async function fetchRagas(): Promise<string[]> {
  return apiFetch<string[]>('/ragas');
}

/**
 * Fetch list of all distinct thalas
 */
export async function fetchThalas(): Promise<string[]> {
  return apiFetch<string[]>('/thalas');
}