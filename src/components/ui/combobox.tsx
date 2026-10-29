import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, Plus, Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface ComboboxProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onCreate?: (typedText: string) => Promise<string | void>;
  quickPicks?: ComboboxOption[];
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search or add...',
  emptyText = 'No items found',
  onCreate,
  quickPicks = [],
  allowClear = true,
  disabled = false,
  className,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((o) => o.value === value) || null;
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, query]);

  const exactMatchExists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return options.some((opt) => opt.label.toLowerCase() === q);
  }, [options, query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const handleSelect = (val: string) => {
    if (value === val && allowClear) {
      onChange(null);
    } else {
      onChange(val);
    }
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!onCreate || !query.trim() || isCreating) return;
    try {
      setIsCreating(true);
      const newId = await onCreate(query.trim());
      if (newId) {
        onChange(newId);
      }
      setOpen(false);
    } catch (err) {
      console.error('Failed to create new combobox item:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn('relative w-full space-y-1.5', className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild disabled={disabled}>
          <button
            type="button"
            id={id}
            aria-expanded={open}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 py-1.5 text-xs text-[#141413] shadow-none transition-colors hover:border-[#183B32]/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]',
              disabled && 'cursor-not-allowed opacity-50 bg-[#F4F1EA]',
              !selectedOption && 'text-[#87837B]'
            )}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {allowClear && selectedOption && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onChange(null);
                    }
                  }}
                  className="rounded p-0.5 text-[#87837B] hover:text-[#141413] hover:bg-[#F4F1EA]"
                  title="Clear selection"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 text-[#87837B]" />
            </div>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[240px] max-w-[420px] rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white p-1 text-[#141413] shadow-md outline-none animate-in fade-in-0 zoom-in-95"
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-[#E7E3DA] px-2.5 pb-1.5 pt-1">
              <Search className="h-3.5 w-3.5 shrink-0 text-[#87837B] mr-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-[#141413] outline-none placeholder:text-[#87837B]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0].value);
                    } else if (onCreate && query.trim() && !exactMatchExists) {
                      handleCreate();
                    }
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-0.5 text-[#87837B] hover:text-[#141413]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Options list */}
            <div className="max-h-56 overflow-y-auto p-1 text-xs">
              {filteredOptions.length === 0 ? (
                <div className="py-2 px-2 text-center text-[#87837B]">
                  {options.length === 0 ? (
                    <span className="block text-[11px] mb-1">{emptyText}</span>
                  ) : (
                    <span className="block text-[11px] mb-1">No matching results</span>
                  )}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[var(--radius-xs)] px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-[#F4F1EA]',
                        isSelected && 'bg-[#EFF4F2] text-[#183B32] font-medium'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate text-[#141413]">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="truncate text-[10px] text-[#87837B] font-mono">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#183B32]" />}
                    </button>
                  );
                })
              )}

              {/* "Add <typed text>" quick create action */}
              {onCreate && query.trim() && !exactMatchExists && (
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreate}
                  className="mt-1 flex w-full items-center gap-2 rounded-[var(--radius-xs)] border-t border-[#E7E3DA] px-2.5 py-2 text-left text-xs font-medium text-[#183B32] hover:bg-[#EFF4F2] transition-colors"
                >
                  {isCreating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    Add &quot;<span className="font-semibold">{query.trim()}</span>&quot;
                  </span>
                </button>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Quick-pick chips for most recently used items */}
      {quickPicks && quickPicks.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase tracking-wider text-[#87837B]">Recent:</span>
          {quickPicks.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => onChange(chip.value)}
              className={cn(
                'inline-flex items-center text-[11px] px-2 py-0.5 rounded-[var(--radius-xs)] border transition-colors',
                value === chip.value
                  ? 'border-[#183B32] bg-[#EFF4F2] text-[#183B32] font-medium'
                  : 'border-[#E7E3DA] bg-white text-[#5C5955] hover:bg-[#F4F1EA] hover:text-[#141413]'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
