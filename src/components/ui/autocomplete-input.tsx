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

  const showCreateOption = onCreate && searchValue && 
    !filteredItems.some(item => item.name.toLowerCase() === searchValue.toLowerCase());

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
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
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
                <CommandItem onSelect={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
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