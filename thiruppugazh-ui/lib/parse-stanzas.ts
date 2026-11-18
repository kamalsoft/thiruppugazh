export type Stanza = { lines: string[]; no: number | null };
export type Section = { title: string | null; stanzas: Stanza[] };

// A verse ends with a number in brackets after dots, for example "...... (5)".
const VERSE_END = /\s*\.{3,}\s*\((\d+)\)\s*$/;

// Blank lines separate stanzas. A heading is an indented line that is not a verse end.
export function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  let section: Section = { title: null, stanzas: [] };
  let lines: string[] = [];
  let no: number | null = null;

  const flush = () => {
    if (lines.length) section.stanzas.push({ lines, no });
    lines = [];
    no = null;
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^\s{4,}\S/.test(raw) && !VERSE_END.test(line)) {
      flush();
      if (section.title !== null || section.stanzas.length) sections.push(section);
      section = { title: line, stanzas: [] };
      continue;
    }
    const end = line.match(VERSE_END);
    if (end) {
      lines.push(line.replace(VERSE_END, ''));
      no = Number(end[1]);
      flush();
    } else {
      lines.push(line);
    }
  }
  flush();
  if (section.title !== null || section.stanzas.length) sections.push(section);
  return sections;
}
