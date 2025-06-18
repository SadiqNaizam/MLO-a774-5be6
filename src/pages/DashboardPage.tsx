import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Custom Components
import FileListItem from '@/components/FileListItem';
import FileUploadArea from '@/components/FileUploadArea';
import StorageUsageBar from '@/components/StorageUsageBar';

// Shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Lucide Icons
import {
  Search,
  FolderPlus,
  ArrowUpDown,
  UserCircle,
  Settings as SettingsIcon,
  LogOut,
  LayoutDashboard, // Icon for Dashboard link / App Logo
  Home as HomeIcon,
  FileUp,
  Filter,
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string; // e.g., "1.2 MB"
  lastModified: string; // e.g., "2024-07-29"
  isFavorite?: boolean;
}

// Helper function to format file size (similar to one in FileUploadArea for consistency if needed)
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const initialFiles: FileItem[] = [
  { id: 'file-1', name: 'Annual Report 2023.pdf', type: 'file', size: formatBytes(2500000), lastModified: '2024-07-15', isFavorite: true },
  { id: 'folder-1', name: 'Project Alpha', type: 'folder', lastModified: '2024-07-20' },
  { id: 'file-2', name: 'Client Presentation Q3.pptx', type: 'file', size: formatBytes(5100000), lastModified: '2024-07-28' },
  { id: 'folder-2', name: 'Meeting Notes', type: 'folder', lastModified: '2024-07-29', isFavorite: false },
  { id: 'file-3', name: 'invoice_ACME_Corp.docx', type: 'file', size: formatBytes(120000), lastModified: '2024-07-30' },
];

type SortKey = 'name' | 'lastModified' | 'size' | 'type';
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

const DashboardPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  // For simplicity, breadcrumb path is static here. Could be dynamic with routing.
  const [currentPath] = useState<{ name: string, path: string }[]>([
    { name: "Home", path: "/" },
    { name: "My Files", path: "/"} // Current page
  ]);

  useEffect(() => {
    console.log('DashboardPage loaded');
  }, []);

  const handleFilesUploaded = (uploadedNativeFiles: File[]) => {
    const newFileItems: FileItem[] = uploadedNativeFiles.map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      name: file.name,
      type: 'file', // Assuming all uploads are files
      size: formatBytes(file.size),
      lastModified: new Date().toLocaleDateString(), // Or get from file.lastModifiedDate if available
      isFavorite: false,
    }));
    setFiles(prevFiles => [...prevFiles, ...newFileItems]);
    toast.success(`${newFileItems.length} file(s) uploaded successfully!`);
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName && folderName.trim() !== "") {
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: folderName.trim(),
        type: 'folder',
        lastModified: new Date().toLocaleDateString(),
      };
      setFiles(prevFiles => [newFolder, ...prevFiles]);
      toast.success(`Folder "${folderName.trim()}" created.`);
    } else if (folderName !== null) { // User didn't cancel but entered empty name
        toast.error("Folder name cannot be empty.");
    }
  };
  
  const handleDeleteFile = (fileId: string) => {
    const fileName = files.find(f => f.id === fileId)?.name || 'Item';
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    toast.info(`"${fileName}" deleted.`);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, name: newName, lastModified: new Date().toLocaleDateString() } : file
      )
    );
    toast.success(`Item renamed to "${newName}".`);
  };
  
  const handleToggleFavorite = (fileId: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
      )
    );
  };


  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    return files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  const sortedAndFilteredFiles = useMemo(() => {
    let sortableItems = [...filteredFiles];
    sortableItems.sort((a, b) => {
      let comparison = 0;
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (sortConfig.key === 'size') {
        // Helper to parse size string "X.YZ KB/MB/GB" to bytes for sorting
        const parseSize = (sizeStr?: string): number => {
          if (!sizeStr) return 0; // Folders or files with no size
          const parts = sizeStr.split(' ');
          const value = parseFloat(parts[0]);
          const unit = parts[1]?.toUpperCase();
          if (unit === 'KB') return value * 1024;
          if (unit === 'MB') return value * 1024 * 1024;
          if (unit === 'GB') return value * 1024 * 1024 * 1024;
          return value; // Bytes or unknown
        };
        comparison = parseSize(a.size) - parseSize(b.size);
      } else if (sortConfig.key === 'lastModified') {
        comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime(); // Default newest first
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }
      // Type specific sort: folders first/last or grouped
      if (a.type === 'folder' && b.type === 'file') comparison = -1; // Folders first
      if (a.type === 'file' && b.type === 'folder') comparison = 1;  // Files after folders

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sortableItems;
  }, [filteredFiles, sortConfig]);
  
  const handleSortChange = (key: SortKey) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { ...prevConfig, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header Placeholder */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-primary dark:text-primary-foreground">
            <LayoutDashboard className="h-7 w-7" />
            <span>EWFW</span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Future: Global search or quick actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center w-full">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/login" className="flex items-center w-full"> {/* Assuming logout redirects to login */}
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-6">
        {/* Top Control Bar: Breadcrumbs, Search, Actions */}
        <section className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Breadcrumb>
            <BreadcrumbList>
              {currentPath.map((item, index) => (
                <React.Fragment key={item.name}>
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.path} className="flex items-center gap-1">
                          {index === 0 && <HomeIcon className="h-4 w-4" />} {item.name}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < currentPath.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 mt-4 md:mt-0">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search files & folders..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button onClick={handleCreateFolder} variant="outline" className="flex-1 sm:flex-none">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Filter className="mr-2 h-4 w-4" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={`${sortConfig.key}-${sortConfig.direction}`} onValueChange={(value) => {
                      const [key, direction] = value.split('-') as [SortKey, 'asc' | 'desc'];
                      setSortConfig({key, direction});
                  }}>
                    {(['name', 'lastModified', 'size', 'type'] as SortKey[]).map(key => (
                        <React.Fragment key={key}>
                        <DropdownMenuRadioItem value={`${key}-asc`}>
                            {key.charAt(0).toUpperCase() + key.slice(1)} (Asc)
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value={`${key}-desc`}>
                            {key.charAt(0).toUpperCase() + key.slice(1)} (Desc)
                        </DropdownMenuRadioItem>
                        </React.Fragment>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* File List & Upload/Storage Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File List */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>My Files ({sortedAndFilteredFiles.length})</CardTitle>
                {/* Optionally add view mode toggles (grid/list) here */}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px] pr-3"> {/* Adjust height as needed */}
                  {sortedAndFilteredFiles.length > 0 ? (
                    <div className="space-y-1">
                      {sortedAndFilteredFiles.map(file => (
                        <FileListItem
                          key={file.id}
                          {...file}
                          onDelete={handleDeleteFile}
                          onRename={handleRenameFile}
                          onToggleFavorite={handleToggleFavorite}
                          // Other handlers like onDownload, onMove, onShare can be added here
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      <FileUp className="mx-auto h-12 w-12 mb-4" />
                      <p className="font-semibold">No files or folders found.</p>
                      <p className="text-sm">Try uploading some files or adjusting your search/filters.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Upload and Storage */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <FileUploadArea
              onUploadSuccess={handleFilesUploaded}
              maxFiles={10}
              maxFileSize={10 * 1024 * 1024} // 10MB
            />
            <StorageUsageBar
              currentUsageInGB={files.reduce((acc, file) => {
                if (file.type === 'file' && file.size) {
                  const sizeParts = file.size.split(' ');
                  const value = parseFloat(sizeParts[0]);
                  const unit = sizeParts[1]?.toUpperCase();
                  if (unit === 'KB') return acc + value / (1024*1024); // to GB
                  if (unit === 'MB') return acc + value / 1024; // to GB
                  if (unit === 'GB') return acc + value;
                  // Bytes assumed negligible for GB total
                }
                return acc;
              }, 0)}
              totalStorageInGB={50} // Example total storage
            />
          </div>
        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className="bg-gray-200 dark:bg-gray-800 p-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700 mt-auto">
        © {new Date().getFullYear()} Easy Web File Workbench. All rights reserved.
      </footer>
    </div>
  );
};

export default DashboardPage;