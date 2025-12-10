"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  GripVertical,
  Link as LinkIcon,
  Pencil,
  Play,
  Plus,
  Trash2,
  Video as VideoIcon,
  ExternalLink,
} from "lucide-react";
import { createVideo, deleteVideo, updateVideo, reorderVideos } from "@/app/actions/course-actions";
import { toast } from "sonner";
import { Video } from "@prisma/client";

interface VideosListProps {
  chapterId: number;
  videos: Video[];
}

export const VideosList = ({ chapterId, videos }: VideosListProps) => {
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localVideos, setLocalVideos] = useState(videos);
  
  // Update local videos when props change
  if (videos !== localVideos && !draggedIndex) {
    setLocalVideos(videos);
  }
  
  const handleAddVideo = async () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    const result = await createVideo({
      title: newVideoTitle.trim(),
      url: newVideoUrl.trim(),
      chapterId,
      order: videos.length + 1,
    });
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Video added successfully");
      setNewVideoTitle("");
      setNewVideoUrl("");
      setIsAddingVideo(false);
    } else {
      toast.error(result.error || "Failed to add video");
    }
  };
  
  const handleUpdateVideo = async () => {
    if (!editingVideo || !editTitle.trim() || !editUrl.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    const result = await updateVideo(editingVideo.id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
    });
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Video updated successfully");
      setEditingVideo(null);
    } else {
      toast.error(result.error || "Failed to update video");
    }
  };
  
  const handleDeleteVideo = async () => {
    if (!deletingVideo) return;
    
    setIsLoading(true);
    const result = await deleteVideo(deletingVideo.id);
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Video deleted successfully");
      setDeletingVideo(null);
    } else {
      toast.error(result.error || "Failed to delete video");
    }
  };
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newVideos = [...localVideos];
    const [draggedItem] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(index, 0, draggedItem);
    setLocalVideos(newVideos);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    
    const videoIds = localVideos.map((v) => v.id);
    setDraggedIndex(null);
    
    const result = await reorderVideos(chapterId, videoIds);
    if (!result.success) {
      toast.error("Failed to reorder videos");
      setLocalVideos(videos);
    }
  };
  
  return (
    <div className="p-4">
      {localVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <VideoIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            No videos in this chapter yet
          </p>
          <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-3" tabIndex={0}>
                <Plus className="h-4 w-4 mr-1" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription>
                  Add a video to this chapter
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-video-title">Video Title</Label>
                  <Input
                    id="new-video-title"
                    placeholder="e.g., Introduction to the topic"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    disabled={isLoading}
                    aria-label="Video title"
                    tabIndex={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-video-url">Video URL</Label>
                  <Input
                    id="new-video-url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    disabled={isLoading}
                    aria-label="Video URL"
                    tabIndex={0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingVideo(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddVideo}
                  disabled={isLoading || !newVideoTitle.trim() || !newVideoUrl.trim()}
                >
                  {isLoading ? "Adding..." : "Add Video"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-2">
          {localVideos.map((video, index) => (
            <div
              key={video.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background hover:border-border/80 transition-all cursor-move ${
                draggedIndex === index ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <Play className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{video.title}</p>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={0}
                    aria-label={`Open video link for ${video.title}`}
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span className="max-w-[200px] truncate">{video.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingVideo(video);
                    setEditTitle(video.title);
                    setEditUrl(video.url);
                  }}
                  aria-label={`Edit video ${video.title}`}
                  tabIndex={0}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingVideo(video);
                  }}
                  aria-label={`Delete video ${video.title}`}
                  tabIndex={0}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-dashed"
                tabIndex={0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription>
                  Add a video to this chapter
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="add-video-title">Video Title</Label>
                  <Input
                    id="add-video-title"
                    placeholder="e.g., Introduction to the topic"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    disabled={isLoading}
                    aria-label="Video title"
                    tabIndex={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-video-url">Video URL</Label>
                  <Input
                    id="add-video-url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    disabled={isLoading}
                    aria-label="Video URL"
                    tabIndex={0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingVideo(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddVideo}
                  disabled={isLoading || !newVideoTitle.trim() || !newVideoUrl.trim()}
                >
                  {isLoading ? "Adding..." : "Add Video"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {/* Edit Video Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update the video details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-video-title">Video Title</Label>
              <Input
                id="edit-video-title"
                placeholder="e.g., Introduction to the topic"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isLoading}
                aria-label="Edit video title"
                tabIndex={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-video-url">Video URL</Label>
              <Input
                id="edit-video-url"
                placeholder="https://youtube.com/watch?v=..."
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                disabled={isLoading}
                aria-label="Edit video URL"
                tabIndex={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingVideo(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateVideo}
              disabled={isLoading || !editTitle.trim() || !editUrl.trim()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Video Dialog */}
      <Dialog open={!!deletingVideo} onOpenChange={() => setDeletingVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingVideo?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingVideo(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVideo}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

