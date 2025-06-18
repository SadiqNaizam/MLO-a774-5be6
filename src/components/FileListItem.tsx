import React from 'react';
import {
  FileText,
  Folder,
  MoreVertical,
  Edit,
  Trash2,
  Download as DownloadIcon,
  Move,
  Star,
  Share2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge'; // Added for potential future use like tags

interface FileListItemProps {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string; // e.g., "1.2 MB", "N/A" for folders
  lastModified: string; // e.g., "2024-07-29" or "3 hours ago"
  isFavorite?: boolean;
  onRename?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onMove?: (id: string) => void;
  onShare?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  id,
  name,
  type,
  size,
  lastModified,
  isFavorite = false,
  onRename = (fileId) => console.log(`Rename action triggered for ${fileId}`),
  onDelete = (fileId) => console.log(`Delete action triggered for ${fileId}`),
  onDownload = (fileId) => console.log(`Download action triggered for ${fileId}`),
  onMove = (fileId) => console.log(`Move action triggered for ${fileId}`),
  onShare = (fileId) => console.log(`Share action triggered for ${fileId}`),
  onToggleFavorite = (fileId) => console.log(`Toggle favorite for ${fileId}`),
  onViewDetails = (fileId) => console.log(`View details for ${fileId}`),
}) => {
  console.log('FileListItem loaded for:', name);

  const handleRename = () => {
    const newName = prompt(`Enter new name for ${name}:`, name);
    if (newName && newName !== name) {
      onRename(id, newName);
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
        {type === 'file' ? (
          <FileText className="w-5 h-5 text-blue-500" />
        ) : (
          <Folder className="w-5 h-5 text-yellow-500" />
        )}
      </div>

      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={name}>
          {name}
        </p>
        {type === 'file' && size && (
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{size}</p>
        )}
      </div>
      
      <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300 mx-4 w-32 text-right flex-shrink-0">
        {lastModified}
      </div>

      {isFavorite && (
        <div className="mx-2 flex-shrink-0">
           <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      <div className="flex-shrink-0 ml-auto md:ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(id)}>
              <Info className="mr-2 h-4 w-4" />
              <span>Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite(id)}>
              <Star className="mr-2 h-4 w-4" />
              <span>{isFavorite ? 'Unfavorite' : 'Favorite'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onDownload && type === 'file' && (
              <DropdownMenuItem onClick={() => onDownload(id)}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleRename}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(id)}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(id)}>
              <Move className="mr-2 h-4 w-4" />
              <span>Move</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-600 hover:!text-red-600 focus:!text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FileListItem;