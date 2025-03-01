import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ICONS from '@/components/dashboard/availableIcons';
import { IconSelectorProps } from '@/types/project-types';

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onIconChange }) => {
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  const filteredIcons = iconSearchQuery.trim() === ""
    ? ICONS
    : ICONS.filter(icon =>
      icon.id.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      (icon.label && icon.label.toLowerCase().includes(iconSearchQuery.toLowerCase()))
    );

  return (
    <div className="relative">
      {/* Selected icon display */}
      <button
        type="button"
        onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
        className="flex items-center justify-between w-full p-4 bg-muted border rounded-lg hover:bg-muted/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="flex items-center gap-3">
          {ICONS.find(icon => icon.id === selectedIcon)?.icon}
          <span className="text-sm capitalize">{selectedIcon}</span>
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform ${iconDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Icon dropdown */}
      {iconDropdownOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-[300px] overflow-y-auto border rounded-lg bg-background shadow-lg">
          <div className="sticky top-0 bg-background border-b p-2">
            <Input
              placeholder="Search icons..."
              value={iconSearchQuery}
              onChange={(e) => setIconSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 p-2">
            {filteredIcons.map((icon) => (
              <div
                key={icon.id}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                  selectedIcon === icon.id && "bg-primary/10 border border-primary"
                )}
                onClick={() => {
                  onIconChange(icon.id);
                  setIconDropdownOpen(false);
                }}
              >
                {icon.icon}
              </div>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No icons match your search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IconSelector;