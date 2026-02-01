import { FormEvent } from "react";

export type SearchSuggestion = { bootId: string; label: string };

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  suggestions?: SearchSuggestion[];
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
};

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  loading = false,
  suggestions = [],
  onSelectSuggestion,
  placeholder = "e.g., Salomon S/Pro 100",
}: SearchBoxProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-box">
        <span className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16.5 16.5L21 21"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="search"
          className="search-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search for a ski boot"
        />
        <button className="sr-only" type="submit" disabled={loading}>
          Search
        </button>
        {suggestions.length > 0 && (
          <div className="suggestions" role="listbox">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.bootId}
                type="button"
                className="suggestion"
                role="option"
                onClick={() => onSelectSuggestion?.(suggestion)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {loading && <div className="search-status">Searching...</div>}
    </form>
  );
}
