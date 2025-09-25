import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AutocompleteItem {
  id: string;
  name: string;
}

interface AutocompleteInputProps {
  items: AutocompleteItem[];
  value?: string;
  onSelect: (value: string) => void;
  onCreate?: (name: string) => Promise<void>;
  placeholder?: string;
  createLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function AutocompleteInput({
  items,
  value,
  onSelect,
  onCreate,
  placeholder = "Select...",
  createLabel = "Create",
  className,
  disabled,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedItem = items.find(item => item.id === value);
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption = onCreate && searchValue.trim() && 
    !filteredItems.some(item => item.name.toLowerCase() === searchValue.toLowerCase().trim());

  const handleCreate = async () => {
    if (onCreate && searchValue) {
      await onCreate(searchValue);
      setSearchValue('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-popover border shadow-md z-50" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            {filteredItems.length === 0 && !showCreateOption ? (
              <CommandEmpty>
                {searchValue ? `No results found for "${searchValue}".` : "Start typing to search..."}
              </CommandEmpty>
            ) : null}
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    console.log('Selected item:', item.name, item.id);
                    onSelect(item.id);
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem 
                  onSelect={handleCreate}
                  className="bg-muted/50 border-t font-medium text-primary hover:bg-primary/10"
                >
                  <Plus className="mr-2 h-4 w-4 text-primary" />
                  {createLabel} "{searchValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}