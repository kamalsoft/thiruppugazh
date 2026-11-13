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
  english?: string[];
  meaning?: string[];
  translation_note?: string;
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
