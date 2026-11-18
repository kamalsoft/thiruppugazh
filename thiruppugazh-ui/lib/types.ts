export interface SongSummary {
  song_number: number;
  title: string;
  category_or_place: string;
  raga: string;
  thala: string;
  chandam_structure?: string;
  first_line?: string;
}

export interface SongDetail extends SongSummary {
  chandam: string[];
  lyrics: string[];
  full_text: string;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  results: SongSummary[];
}

export interface PlaceMapping {
  place: string;
  total_songs: number;
  song_numbers: number[];
}

export interface SongTextSummary {
  id: string;
  name: string;
  eyebrow: string;
  title: string;
  author: string;
  author_id: string;
  source: string;
}

export interface SongTextPage {
  total: number;
  page: number;
  limit: number;
  results: SongTextSummary[];
}

export interface AuthorSummary {
  id: string;
  name: string;
  count: number;
}

export interface SongTextDetail extends SongTextSummary {
  text: string;
}
