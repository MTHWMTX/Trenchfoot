import { parseKeywords } from '../../lib/keyword-parser';
import { useKeywords } from '../../features/rules/hooks';
import { KeywordLink } from './KeywordLink';

interface KeywordTextProps {
  text: string;
}

export function KeywordText({ text }: KeywordTextProps) {
  const keywords = useKeywords();

  if (!keywords.length) return <>{text}</>;

  const segments = parseKeywords(text, keywords);

  return (
    <>
      {segments.map((segment, i) =>
        segment.type === 'keyword' && segment.keyword ? (
          <KeywordLink key={i} keyword={segment.keyword}>
            {segment.value}
          </KeywordLink>
        ) : (
          <span key={i}>{segment.value}</span>
        )
      )}
    </>
  );
}
