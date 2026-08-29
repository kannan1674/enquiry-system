'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/store';


interface WishlistItem {
  TemplateId: string;
  TemplateName: string;
  [key: string]: unknown;
}

export default function WishlistDialog({ open, onClose, onLoad }: { open: boolean, onClose: () => void, onLoad: (item: WishlistItem) => void }) {
  const wishlistRaw = useAppSelector((state) => state.wishlistState.content);
  const wishlist: WishlistItem[] = Array.isArray(wishlistRaw) ? wishlistRaw : [];
  const [search, setSearch] = useState('');
  const filtered = wishlist.filter((item: WishlistItem) =>
    item.TemplateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
     
        <DialogHeader>
              {/* Breadcrumb Section - Above Card */}
         
          <DialogTitle>My Wishlist</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search template name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4"
        />
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="text-gray-500 text-center">No templates found.</li>
          ) : (
            filtered.map((item: WishlistItem) => (
              <li key={item.TemplateId} className="flex items-center justify-between p-2 border rounded">
                <span>{item.TemplateName}</span>
                <Button size="sm" onClick={() => onLoad(item)}>Load</Button>
              </li>
            ))
          )}
        </ul>
        <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
} 