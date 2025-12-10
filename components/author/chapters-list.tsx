"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { createChapter, deleteChapter, updateChapter } from "@/app/actions/course-actions";
import { toast } from "sonner";
import { VideosList } from "./videos-list";
import { Chapter, Video as VideoType } from "@/app/generated/prisma/client";

interface ChapterWithVideos extends Chapter {
  videos: VideoType[];
}

interface ChaptersListProps {
  courseId: number;
  chapters: ChapterWithVideos[];
}

export const ChaptersList = ({ courseId, chapters }: ChaptersListProps) => {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterWithVideos | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingChapter, setDeletingChapter] = useState<ChapterWithVideos | null>(null);
  const [openChapters, setOpenChapters] = useState<number[]>([]);
  
  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }
    
    setIsLoading(true);
    const result = await createChapter({
      title: newChapterTitle.trim(),
      courseId,
      order: chapters.length + 1,
    });
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Chapter created successfully");
      setNewChapterTitle("");
      setIsAddingChapter(false);
    } else {
      toast.error(result.error || "Failed to create chapter");
    }
  };
  
  const handleUpdateChapter = async () => {
    if (!editingChapter || !editTitle.trim()) {
      toast.error("Please enter a chapter title");
      return;
    }
    
    setIsLoading(true);
    const result = await updateChapter(editingChapter.id, editTitle.trim());
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Chapter updated successfully");
      setEditingChapter(null);
    } else {
      toast.error(result.error || "Failed to update chapter");
    }
  };
  
  const handleDeleteChapter = async () => {
    if (!deletingChapter) return;
    
    setIsLoading(true);
    const result = await deleteChapter(deletingChapter.id);
    setIsLoading(false);
    
    if (result.success) {
      toast.success("Chapter deleted successfully");
      setDeletingChapter(null);
    } else {
      toast.error(result.error || "Failed to delete chapter");
    }
  };
  
  const toggleChapter = (chapterId: number) => {
    setOpenChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };
  
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chapters
          </CardTitle>
          <CardDescription>
            Organize your course content into chapters
          </CardDescription>
        </div>
        <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
              <DialogDescription>
                Create a new chapter for your course
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Chapter title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                disabled={isLoading}
                aria-label="New chapter title"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleAddChapter();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingChapter(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddChapter}
                disabled={isLoading || !newChapterTitle.trim()}
              >
                {isLoading ? "Creating..." : "Create Chapter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No chapters yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Start building your course by adding chapters. Each chapter can contain multiple videos.
            </p>
            <Button
              onClick={() => setIsAddingChapter(true)}
              className="mt-4"
              tabIndex={0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Chapter
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <Collapsible
                key={chapter.id}
                open={openChapters.includes(chapter.id)}
                onOpenChange={() => toggleChapter(chapter.id)}
              >
                <div className="rounded-lg border border-border/40 overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      role="button"
                      tabIndex={0}
                      aria-expanded={openChapters.includes(chapter.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleChapter(chapter.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          {openChapters.includes(chapter.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Chapter {index + 1}
                            </span>
                          </div>
                          <h4 className="font-medium">{chapter.title}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          {chapter.videos.length} videos
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChapter(chapter);
                            setEditTitle(chapter.title);
                          }}
                          aria-label={`Edit chapter ${chapter.title}`}
                          tabIndex={0}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChapter(chapter);
                          }}
                          aria-label={`Delete chapter ${chapter.title}`}
                          tabIndex={0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border/40 bg-muted/30">
                      <VideosList chapterId={chapter.id} videos={chapter.videos} />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Edit Chapter Dialog */}
      <Dialog open={!!editingChapter} onOpenChange={() => setEditingChapter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              Update the chapter title
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Chapter title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isLoading}
              aria-label="Edit chapter title"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleUpdateChapter();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingChapter(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateChapter}
              disabled={isLoading || !editTitle.trim()}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Chapter Dialog */}
      <Dialog open={!!deletingChapter} onOpenChange={() => setDeletingChapter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingChapter?.title}&quot;? This will also delete all videos in this chapter.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingChapter(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChapter}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

