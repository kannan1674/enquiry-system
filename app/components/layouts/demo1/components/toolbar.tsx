'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Upload } from 'lucide-react';

interface ToolbarProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  showImport?: boolean;
}

export function Toolbar({
  onSearch,
  onFilter,
  onExport,
  onImport,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showFilter = true,
  showExport = false,
  showImport = false,
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white border-b">
      <div className="flex items-center gap-4 flex-1">
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        )}
        
        {showFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilter}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showImport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        )}
        
        {showExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
} 