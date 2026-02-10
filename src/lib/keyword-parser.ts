import type { Keyword } from '../types';

export interface TextSegment {
  type: 'text' | 'keyword';
  value: string;
  keyword?: Keyword;
}

export function parseKeywords(text: string, keywords: Keyword[]): TextSegment[] {
  if (!text || keywords.length === 0) {
    return [{ type: 'text', value: text }];
  }

  // Build a lookup of all terms and aliases → keyword
  const termMap = new Map<string, Keyword>();
  for (const kw of keywords) {
    termMap.set(kw.term.toLowerCase(), kw);
    for (const alias of kw.aliases) {
      termMap.set(alias.toLowerCase(), kw);
    }
  }

  // Sort terms by length (longest first) to match multi-word terms before single-word
  const allTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);

  // Build regex that matches any known term (case-insensitive, word boundaries)
  const escaped = allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const matchStart = match.index;
    const matchText = match[0];
    const keyword = termMap.get(matchText.toLowerCase());

    // Add preceding plain text
    if (matchStart > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, matchStart) });
    }

    // Add keyword segment
    if (keyword) {
      segments.push({ type: 'keyword', value: matchText, keyword });
    } else {
      segments.push({ type: 'text', value: matchText });
    }

    lastIndex = matchStart + matchText.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
