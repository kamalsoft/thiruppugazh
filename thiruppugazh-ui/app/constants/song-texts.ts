import { KANDHA_GURU_KAVACHAM, KANDHA_GURU_KAVACHAM_CREDIT, KANDHA_GURU_KAVACHAM_TITLE } from './kandha-guru-kavacham';
import { KANDAR_ANUBHUTI, KANDAR_ANUBHUTI_TITLE } from './kandar-anubhuti';
import { KANDAR_ALANKARAM, KANDAR_ALANKARAM_TITLE } from './kandar-alankaram';

// Template for song texts shown in the "பிற பாடல்கள்" tab.
//
// To add a text:
// 1. Put the Unicode text in its own file in this folder, as a template literal:
//      export const MY_TEXT = `...`;
//    Verse ends use "...... (N)". Blank lines separate stanzas.
//    An indented line (4+ spaces) is a section heading.
// 2. Add one entry to SONG_TEXTS below. The tab, selector and credit line update by themselves.
//
// Keep the source credit. Use only texts that are allowed for the site's use.

export type SongText = {
  id: string;           // unique and stable, used as the React key
  name: string;         // label on the selector button
  eyebrow: string;      // small label above the heading
  title: string;        // full title as printed in the source
  text: string;         // the verse text, in the format described above
  author: string;       // the author as credited in the source
  source: string;       // for example "Project Madurai"
  sourceNote?: string;  // optional short note, for example a file name or licence wording
};

export const SONG_TEXTS: SongText[] = [
  {
    id: 'kandha-guru-kavacham',
    name: 'கந்த குரு கவசம்',
    eyebrow: 'முருகன் கவசம்',
    title: KANDHA_GURU_KAVACHAM_TITLE,
    text: KANDHA_GURU_KAVACHAM,
    author: KANDHA_GURU_KAVACHAM_CREDIT.author,
    source: KANDHA_GURU_KAVACHAM_CREDIT.source,
    sourceNote: 'pm0034_03.pdf',
  },
  {
    id: 'kandar-anubhuti',
    name: 'கந்தர் அனுபூதி',
    eyebrow: 'அருணகிரிநாதர்',
    title: KANDAR_ANUBHUTI_TITLE,
    text: KANDAR_ANUBHUTI,
    author: 'அருணகிரிநாதர்',
    source: 'Open access',
  },
  {
    id: 'kandar-alankaram',
    name: 'கந்தர் அலங்காரம்',
    eyebrow: 'அருணகிரிநாதர்',
    title: KANDAR_ALANKARAM_TITLE,
    text: KANDAR_ALANKARAM,
    author: 'அருணகிரிநாதர்',
    source: 'Open access',
  },
];
