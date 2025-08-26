interface HighlightTextProps {
  text: string;
  searchQuery: string;
}

export function HighlightText({ text, searchQuery }: HighlightTextProps) {
  if (!searchQuery || !text) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}