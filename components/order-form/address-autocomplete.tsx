"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

type Suggestion = {
    id: string;
    weergavenaam: string;
};

type PdokResponse = {
    response?: {
        docs?: Suggestion[];
    };
};

type AddressAutocompleteProps = {
    value: string;
    onSelect: (address: string) => void;
    invalid?: boolean;
};

const PDOK_URL =
    "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest";

export function AddressAutocomplete({
    value,
    onSelect,
    invalid,
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(Boolean(value));
    const containerRef = useRef<HTMLDivElement>(null);

    // Close the dropdown on any click outside the component.
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced PDOK lookup, only while the user is still typing.
    useEffect(() => {
        if (confirmed) return;

        const trimmed = query.trim();
        if (trimmed.length < 3) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSuggestions([]);
            setOpen(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${PDOK_URL}?q=${encodeURIComponent(
                        trimmed
                    )}&rows=6&fq=type:adres`,
                    { signal: controller.signal }
                );
                const data: PdokResponse = await res.json();
                const docs = data.response?.docs ?? [];
                setSuggestions(docs);
                setOpen(docs.length > 0);
            } catch (error) {
                if (
                    !(error instanceof DOMException && error.name === "AbortError")
                ) {
                    setSuggestions([]);
                    setOpen(false);
                }
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query, confirmed]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value);
        setConfirmed(false);
        // Invalidate the stored value until a suggestion is picked.
        if (value) onSelect("");
    }

    function handleSelect(suggestion: Suggestion) {
        setQuery(suggestion.weergavenaam);
        onSelect(suggestion.weergavenaam);
        setConfirmed(true);
        setOpen(false);
        setSuggestions([]);
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={handleChange}
                    onFocus={() => {
                        if (suggestions.length > 0) setOpen(true);
                    }}
                    placeholder="Straat, huisnummer en plaats"
                    aria-invalid={invalid}
                    autoComplete="off"
                    className="pl-9"
                />
                {loading ? (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
            </div>

            {open && suggestions.length > 0 ? (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <span>{suggestion.weergavenaam}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            {confirmed && value ? (
                <p className="mt-2 text-sm text-muted-foreground">
                    Adres bevestigd
                </p>
            ) : null}
        </div>
    );
}
