import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Image as ImageIcon,
  Video,
  Boxes,
  FileText,
  Music,
  Link
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MediaViewProps {
  projectId: string;
  projectTitle: string;
}

interface MediaAsset {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
}

const MediaView: React.FC<MediaViewProps> = ({ projectId, projectTitle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'images' | 'videos' | '3d' | 'documents' | 'audio' | 'links'>('all');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [projectId]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assets:', error);
        return;
      }

      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (fileType: string): 'image' | 'video' | '3d' | 'document' | 'audio' | 'link' => {
    // First check if it's already a simple type (from creator selection)
    const normalizedType = fileType.toLowerCase().trim();
    if (normalizedType === 'image') return 'image';
    if (normalizedType === 'video') return 'video';
    if (normalizedType === '3d') return '3d';
    if (normalizedType === 'document') return 'document';
    if (normalizedType === 'audio') return 'audio';
    if (normalizedType === 'link') return 'link';
    
    // Fallback to MIME type detection for legacy data
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.includes('model') || fileType.includes('gltf') || fileType.includes('glb')) return '3d';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('word') || fileType.includes('sheet')) return 'document';
    if (fileType.includes('url')) return 'link';
    
    // Default to link since everything is link-based now
    return 'link';
  };

  const getTypeIconColor = (fileType: 'image' | 'video' | '3d' | 'document' | 'audio' | 'link') => {
    switch(fileType) {
      case 'image':
        return 'text-blue-400';
      case 'video':
        return 'text-red-400';
      case '3d':
        return 'text-purple-400';
      case 'document':
        return 'text-orange-400';
      case 'audio':
        return 'text-green-400';
      case 'link':
        return 'text-cyan-600';
      default:
        return 'text-white';
    }
  };

  const renderTypeIcon = (fileType: 'image' | 'video' | '3d' | 'document' | 'audio' | 'link', className: string) => {
    switch(fileType) {
      case 'image':
        return <ImageIcon className={className} />;
      case 'video':
        return <Video className={className} />;
      case '3d':
        return <Boxes className={className} />;
      case 'document':
        return <FileText className={className} />;
      case 'audio':
        return <Music className={className} />;
      case 'link':
        return <Link className={className} />;
      default:
        return <Link className={className} />;
    }
  };

  const getTypeColor = (fileType: 'image' | 'video' | '3d' | 'document' | 'audio' | 'link') => {
    switch(fileType) {
      case 'image':
        return 'bg-blue-100 text-blue-600';
      case 'video':
        return 'bg-red-100 text-red-600';
      case '3d':
        return 'bg-purple-100 text-purple-600';
      case 'document':
        return 'bg-orange-100 text-orange-600';
      case 'audio':
        return 'bg-green-100 text-green-600';
      case 'link':
        return 'bg-cyan-100 text-cyan-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (fileType: 'image' | 'video' | '3d' | 'document' | 'audio' | 'link') => {
    switch(fileType) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case '3d':
        return '3D';
      case 'document':
        return 'Document';
      case 'audio':
        return 'Audio';
      case 'link':
        return 'Link';
      default:
        return 'File';
    }
  };

  const getFileDimensions = (asset: MediaAsset): string => {
    // Extract dimensions from metadata if available
    // For now, return placeholder
    return '4096×2160';
  };

  const getAssetCounts = () => {
    const images = assets.filter(a => getFileType(a.file_type) === 'image').length;
    const videos = assets.filter(a => getFileType(a.file_type) === 'video').length;
    const models = assets.filter(a => getFileType(a.file_type) === '3d').length;
    const documents = assets.filter(a => getFileType(a.file_type) === 'document').length;
    const audio = assets.filter(a => getFileType(a.file_type) === 'audio').length;
    const links = assets.filter(a => getFileType(a.file_type) === 'link').length;
    
    return { images, videos, models, documents, audio, links, total: assets.length };
  };

  const counts = getAssetCounts();

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const fileType = getFileType(asset.file_type);
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'images') return matchesSearch && fileType === 'image';
    if (activeFilter === 'videos') return matchesSearch && fileType === 'video';
    if (activeFilter === '3d') return matchesSearch && fileType === '3d';
    if (activeFilter === 'documents') return matchesSearch && fileType === 'document';
    if (activeFilter === 'audio') return matchesSearch && fileType === 'audio';
    if (activeFilter === 'links') return matchesSearch && fileType === 'link';
    
    return matchesSearch;
  });

  const handleOpenAsset = async (asset: MediaAsset) => {
    try {
      let url = asset.file_url;

      if (!url) {
        const { data } = supabase.storage
          .from('project-assets')
          .getPublicUrl(asset.filename);
        url = data?.publicUrl || undefined;
      }

      if (!url) {
        console.error('No accessible URL for asset:', asset.id);
        return;
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening asset:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-1">
          Manage all your media assets for the '<span className="font-semibold">{projectTitle}</span>' project.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter and Sort Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === 'all'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({counts.total})
          {activeFilter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('images')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === 'images'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Images ({counts.images})
          {activeFilter === 'images' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('videos')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === 'videos'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Videos ({counts.videos})
          {activeFilter === 'videos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('3d')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === '3d'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          3D Models ({counts.models})
          {activeFilter === '3d' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('documents')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === 'documents'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Documents ({counts.documents})
          {activeFilter === 'documents' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('audio')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === 'audio'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Audio ({counts.audio})
          {activeFilter === 'audio' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('links')}
          className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
            activeFilter === 'links'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Links ({counts.links})
          {activeFilter === 'links' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden bg-gray-200">
              <div className="aspect-square bg-gray-300"></div>
              <div className="p-2 space-y-1">
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No media files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredAssets.map((asset) => {
            const fileType = getFileType(asset.file_type);
            const typeColor = getTypeColor(fileType);
            const typeIconColor = getTypeIconColor(fileType);
            const typeLabel = getTypeLabel(fileType);
            const thumbnailFailed = failedThumbnails[asset.id];
            
            return (
              <div
                key={asset.id}
                className="group relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenAsset(asset)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleOpenAsset(asset);
                  }
                }}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {/* Type Icon Overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    {renderTypeIcon(
                      fileType,
                      `h-16 w-16 ${typeIconColor} drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] opacity-90`
                    )}
                  </div>

                  {/* Thumbnail Image or Placeholder */}
                  {asset.thumbnail_url && !thumbnailFailed ? (
                    <img
                      src={asset.thumbnail_url}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={() =>
                        setFailedThumbnails((prev) => ({ ...prev, [asset.id]: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-white flex items-center justify-center" aria-hidden="true">
                      {renderTypeIcon(fileType, 'h-14 w-14 text-gray-300 opacity-60')}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 opacity-0 group-hover:opacity-100"></div>
                </div>

                {/* File Info - Compact */}
                <div className="p-2 bg-white">
                  <h3 className="font-medium text-xs text-gray-900 truncate mb-0.5" title={asset.original_filename}>
                    {asset.original_filename}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>
                      {typeLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaView;
