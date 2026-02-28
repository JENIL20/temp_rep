// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { courseApi, courseVideoApi, CourseVideoRequest } from "../api/courseApi";
// import {
//     ArrowLeft,
//     Plus,
//     Trash2,
//     Video,
//     X,
//     GripVertical,
//     Clock,
//     Play,
//     FileText,
//     Image as ImageIcon,
//     Check,
//     Save
// } from "lucide-react";

// import { toast } from "react-toastify";

// interface VideoFormData {
//     id?: number;
//     title: string;
//     description: string;
//     videoUrl: string;
//     duration: number;
//     order: number;
//     thumbnailUrl: string;
//     isActive: boolean;
//     videoFile?: File | null;
// }

// interface Course {
//     id: number;
//     title: string;
//     description: string;
// }

// const CourseVideos = () => {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const courseId = id ? parseInt(id) : null;

//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [course, setCourse] = useState<Course | null>(null);
//     const [videos, setVideos] = useState<VideoFormData[]>([]);
//     const [showVideoForm, setShowVideoForm] = useState(false);
//     const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
//     const [videoFormData, setVideoFormData] = useState<VideoFormData>({
//         title: "",
//         description: "",
//         videoUrl: "",
//         duration: 0,
//         order: 1,
//         thumbnailUrl: "",
//         isActive: true,
//         videoFile: null as File | null,
//     });


//     useEffect(() => {
//         if (courseId) {
//             fetchCourseAndVideos();
//         }
//     }, [courseId]);

//     const fetchCourseAndVideos = async () => {
//         if (!courseId) return;

//         setLoading(true);
//         try {
//             // Fetch course details
//             const courseRes = await courseApi.getById(courseId);
//             console.log("COURSE ", courseRes);
//             setCourse(courseRes[0]);

//             console.log("Fetching videos for courseId =", courseId);
//             // Fetch existing videos
//             const videosRes = await courseVideoApi.listByCourse(courseId)
//             console.log("COURSE VIDEOS ", videosRes);
//             setVideos(videosRes.map((v: any, index: number) => ({
//                 id: v.id,
//                 title: v.title,
//                 description: v.description || '',
//                 videoUrl: v.videoUrl,
//                 duration: v.duration || 0,
//                 order: v.orderIndex || index + 1,
//                 thumbnailUrl: v.thumbnailUrl || '',
//                 isActive: v.isPreview || true,
//             })));
//         } catch (error) {
//             console.error("Failed to fetch course data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { name, value, type } = e.target;
//         setVideoFormData({
//             ...videoFormData,
//             [name]: type === 'number' ? parseFloat(value) || 0 : value,
//         });
//     };

//     const handleAddVideo = () => {
//         if (!videoFormData.title || (!videoFormData.videoUrl && !videoFormData.videoFile)) {
//             toast.error("Please provide a video title and either a URL or upload a file");
//             return;
//         }

//         if (editingVideoIndex !== null) {
//             // Update existing video
//             const updatedVideos = [...videos];
//             updatedVideos[editingVideoIndex] = videoFormData;
//             setVideos(updatedVideos);
//             setEditingVideoIndex(null);
//             toast.success("Video updated successfully!");
//         } else {
//             // Add new video
//             setVideos([...videos, { ...videoFormData, order: videos.length + 1 }]);
//             toast.success("Video added successfully!");
//         }

//         // Reset form
//         setVideoFormData({
//             title: "",
//             description: "",
//             videoUrl: "",
//             duration: 0,
//             order: videos.length + 2,
//             thumbnailUrl: "",
//             isActive: true,
//         });
//         setShowVideoForm(false);
//     };

//     const handleEditVideo = (index: number) => {
//         setVideoFormData(videos[index]);
//         setEditingVideoIndex(index);
//         setShowVideoForm(true);
//     };

//     const handleDeleteVideo = async (index: number) => {
//         const video = videos[index];

//         if (!window.confirm("Are you sure you want to delete this video?")) {
//             return;
//         }

//         try {
//             // If video has an ID, delete it from the server
//             if (video.id) {
//                 await courseVideoApi.delete(video.id);
//             }

//             // Remove from local state
//             setVideos(videos.filter((_, i) => i !== index));
//             toast.success("Video deleted successfully!");
//         } catch (error) {
//             console.error("Failed to delete video:", error);
//             toast.error("Failed to delete video. Please try again.");
//         }
//     };

//     const handleReorderVideo = (index: number, direction: 'up' | 'down') => {
//         const newVideos = [...videos];
//         const targetIndex = direction === 'up' ? index - 1 : index + 1;

//         if (targetIndex < 0 || targetIndex >= newVideos.length) return;

//         [newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]];

//         // Update order numbers
//         newVideos.forEach((video, idx) => {
//             video.order = idx + 1;
//         });

//         setVideos(newVideos);
//     };

//     const handleSaveAllVideos = async () => {
//         if (!courseId) return;

//         setSaving(true);
//         try {
//             // Process each video
//             for (const video of videos) {
//                 console.log("Saving video: ", video);

//                 const requestData: CourseVideoRequest = {
//                     courseId: courseId,
//                     title: video.title,
//                     description: video.description || '',
//                     duration: video.duration || 0,
//                     orderIndex: video.order,
//                     thumbnailUrl: video.thumbnailUrl || '',
//                     isPreview: video.isActive,
//                     videoUrl: video.videoUrl,
//                     file: video.videoFile || undefined
//                 };

//                 if (video.id) {
//                     // Update existing video
//                     const res = await courseVideoApi.update(video.id, requestData);
//                     console.log("Updated video: ", res);
//                 } else {
//                     // Create new video
//                     const created = await courseVideoApi.create(requestData);
//                     console.log("Created video ID:", created.id);
//                     video.id = created.id; // Update with server ID
//                 }
//             }

//             toast.success("All videos saved successfully!");
//             // navigate('/courses');
//         } catch (error) {
//             console.error("Failed to save videos:", error);
//             toast.error("Failed to save videos. Please check the console for details.");
//         } finally {
//             setSaving(false);
//         }
//     };
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-pulse text-gray-600">Loading course videos...</div>
//             </div>
//         );
//     }

//     if (!course) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                     <p className="text-gray-600 mb-4">Course not found</p>
//                     <button
//                         onClick={() => navigate('/courses')}
//                         className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
//                     >
//                         Back to Courses
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-primary-navy via-primary-navy-light to-primary-navy-dark text-white shadow-xl">
//                 <div className="max-w-6xl mx-auto px-6 py-8">
//                     <button
//                         onClick={() => navigate("/courses")}
//                         className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors group"
//                     >
//                         <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//                         <span className="text-sm font-medium">Back to Courses</span>
//                     </button>

//                     <h1 className="text-3xl md:text-4xl font-bold mb-2">
//                         Manage Course Videos
//                     </h1>
//                     <p className="text-white/90 text-lg mb-4">
//                         {course.title}
//                     </p>
//                     <p className="text-white/80 text-sm">
//                         Add, edit, and organize videos for your course
//                     </p>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-6xl mx-auto px-6 mt-8">
//                 <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//                     <div className="p-8">
//                         <div className="flex items-center justify-between mb-6">
//                             <div>
//                                 <h2 className="text-2xl font-bold text-gray-900">Course Videos</h2>
//                                 <p className="text-gray-600 mt-1">
//                                     {videos.length} {videos.length === 1 ? 'video' : 'videos'} added
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={() => {
//                                     setShowVideoForm(true);
//                                     setEditingVideoIndex(null);
//                                     setVideoFormData({
//                                         title: "",
//                                         description: "",
//                                         videoUrl: "",
//                                         duration: 0,
//                                         order: videos.length + 1,
//                                         thumbnailUrl: "",
//                                         isActive: true,
//                                     });
//                                 }}
//                                 className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors shadow-md hover:shadow-lg"
//                             >
//                                 <Plus size={20} />
//                                 Add Video
//                             </button>
//                         </div>

//                         {/* Videos List */}
//                         {videos.length === 0 ? (
//                             <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                                 <Video className="mx-auto text-gray-400 mb-4" size={64} />
//                                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos added yet</h3>
//                                 <p className="text-gray-600 mb-6">Start by adding your first video to the course</p>
//                                 <button
//                                     onClick={() => setShowVideoForm(true)}
//                                     className="inline-flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
//                                 >
//                                     <Plus size={20} />
//                                     Add First Video
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="space-y-3">
//                                 {videos.map((video, index) => (
//                                     <div
//                                         key={index}
//                                         className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
//                                     >
//                                         <div className="flex items-start gap-4">
//                                             {/* Reorder buttons */}
//                                             <div className="flex flex-col gap-2">
//                                                 <button
//                                                     onClick={() => handleReorderVideo(index, 'up')}
//                                                     disabled={index === 0}
//                                                     className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//                                                     title="Move up"
//                                                 >
//                                                     <GripVertical size={20} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleReorderVideo(index, 'down')}
//                                                     disabled={index === videos.length - 1}
//                                                     className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//                                                     title="Move down"
//                                                 >
//                                                     <GripVertical size={20} />
//                                                 </button>
//                                             </div>

//                                             {/* Thumbnail */}
//                                             <div className="w-20 h-20 bg-gradient-to-br from-primary-navy to-primary-navy-light rounded-lg flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
//                                                 {video.thumbnailUrl ? (
//                                                     <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
//                                                 ) : (
//                                                     <Play size={32} />
//                                                 )}
//                                             </div>

//                                             {/* Video Info */}
//                                             <div className="flex-1 min-w-0">
//                                                 <div className="flex items-start justify-between gap-4">
//                                                     <div className="flex-1">
//                                                         <h4 className="font-semibold text-gray-900 mb-1">
//                                                             {video.order}. {video.title}
//                                                         </h4>
//                                                         {video.description && (
//                                                             <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
//                                                         )}
//                                                         <div className="flex items-center gap-4 text-xs text-gray-500">
//                                                             <span className="flex items-center gap-1">
//                                                                 <Clock size={14} />
//                                                                 {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
//                                                             </span>
//                                                             <span className={`px-2 py-0.5 rounded-full ${video.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//                                                                 }`}>
//                                                                 {video.isActive ? 'Published' : 'Draft'}
//                                                             </span>
//                                                             {video.id && (
//                                                                 <span className="flex items-center gap-1 text-blue-600">
//                                                                     <Check size={14} />
//                                                                     Saved
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* Action buttons */}
//                                                     <div className="flex items-center gap-2">
//                                                         <button
//                                                             onClick={() => handleEditVideo(index)}
//                                                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                             title="Edit video"
//                                                         >
//                                                             <FileText size={18} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleDeleteVideo(index)}
//                                                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                                             title="Delete video"
//                                                         >
//                                                             <Trash2 size={18} />
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}

//                         {/* Save Button */}
//                         {videos.length > 0 && (
//                             <div className="flex justify-end gap-3 pt-6 border-t mt-8">
//                                 <button
//                                     onClick={() => navigate('/courses')}
//                                     className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleSaveAllVideos}
//                                     disabled={saving}
//                                     className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     <Save size={20} />
//                                     {saving ? 'Saving...' : 'Save All Videos'}
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Video Form Modal */}
//             {showVideoForm && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-gradient-to-r from-primary-navy to-primary-navy-light text-white px-6 py-4 flex items-center justify-between">
//                             <h3 className="text-xl font-bold">
//                                 {editingVideoIndex !== null ? 'Edit Video' : 'Add New Video'}
//                             </h3>
//                             <button
//                                 onClick={() => {
//                                     setShowVideoForm(false);
//                                     setEditingVideoIndex(null);
//                                 }}
//                                 className="p-2 hover:bg-white/10 rounded-full transition-colors"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>

//                         <div className="p-6 space-y-4">
//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                     Video Title <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="title"
//                                     value={videoFormData.title}
//                                     onChange={handleVideoInputChange}
//                                     placeholder="e.g., Introduction to React"
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     name="description"
//                                     value={videoFormData.description}
//                                     onChange={handleVideoInputChange}
//                                     rows={3}
//                                     placeholder="Brief description of the video content..."
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                     Video File <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="flex gap-2">
//                                     <input
//                                         type="file"
//                                         name="videoFile"
//                                         accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
//                                         onChange={(e) => {
//                                             const file = e.target.files?.[0];
//                                             if (file) {
//                                                 // Store the file in your form data
//                                                 setVideoFormData({
//                                                     ...videoFormData,
//                                                     videoFile: file
//                                                 });
//                                             }
//                                         }}
//                                         className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-navy file:text-white hover:file:bg-primary-navy-light"
//                                     />
//                                 </div>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Select an MP4, MOV, AVI, or WebM video file
//                                 </p>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Duration (seconds)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="duration"
//                                         value={videoFormData.duration}
//                                         onChange={handleVideoInputChange}
//                                         min="0"
//                                         placeholder="e.g., 1200"
//                                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Order
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="order"
//                                         value={videoFormData.order}
//                                         onChange={handleVideoInputChange}
//                                         min="1"
//                                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                     Thumbnail URL
//                                 </label>
//                                 <div className="flex gap-2">
//                                     <input
//                                         type="url"
//                                         name="thumbnailUrl"
//                                         value={videoFormData.thumbnailUrl}
//                                         onChange={handleVideoInputChange}
//                                         placeholder="https://example.com/thumbnail.jpg"
//                                         className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
//                                     />
//                                     <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
//                                         <ImageIcon size={20} />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="flex items-center gap-2 cursor-pointer">
//                                     <input
//                                         type="checkbox"
//                                         checked={videoFormData.isActive}
//                                         onChange={(e) => setVideoFormData({ ...videoFormData, isActive: e.target.checked })}
//                                         className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
//                                     />
//                                     <span className="text-sm font-semibold text-gray-700">Published</span>
//                                 </label>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4 border-t">
//                                 <button
//                                     onClick={() => {
//                                         setShowVideoForm(false);
//                                         setEditingVideoIndex(null);
//                                     }}
//                                     className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleAddVideo}
//                                     className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
//                                 >
//                                     {editingVideoIndex !== null ? 'Update Video' : 'Add Video'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}


//         </div>
//     );
// };

// export default CourseVideos;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Play,
  Clock,
  Video,
  X
} from "lucide-react";

import { courseVideoApi } from '../api/courseApi';
import { toast } from "react-toastify";
import { confirmToast } from "@/shared/utils/confirmToast";

/* ================= TYPES ================= */
interface VideoFormData {
  id?: number;
  title: string;
  description?: string;
  duration: number;
  orderIndex: number;
  isPreview: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
  videoFile?: File | null;
}

/* ================= COMPONENT ================= */

const CourseVideos = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const courseId = id ? Number(id) : null;

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoFormData[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (courseId) fetchVideos();
  }, [courseId]);

  const fetchVideos = async () => {
    try {
      const res = await courseVideoApi.listByCourse(courseId!);
      setVideos(
        res.map((v: any, index: number) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          duration: v.duration || 0,
          orderIndex: v.orderIndex ?? index + 1,
          isPreview: v.isPreview ?? false,
          thumbnailUrl: v.thumbnailUrl,
          videoUrl: v.videoUrl
        }))
      );
    } catch (e) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */

  const handleEdit = (video: VideoFormData) => {
    if (video.id) {
      navigate(`/courses/${courseId}/videos/${video.id}/edit`);
    } else {
      toast.error("Cannot edit unsaved video");
    }
  };

  const handleDelete = async (index: number) => {
    const video = videos[index];
    const ok = await confirmToast({
      title: "Delete video?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      toastOptions: { type: "warning" },
    });
    if (!ok) return;

    try {
      if (video.id) {
        await courseVideoApi.delete(video.id);
      }
      setVideos(videos.filter((_, i) => i !== index));
      toast.success("Video deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePlay = (videoUrl?: string) => {
    if (videoUrl) {
      setPlayingVideo(videoUrl);
    } else {
      toast.error("No video URL available");
    }
  }

  /* ================= RENDER ================= */


  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading videos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-primary-navy text-white px-6 py-6">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 mb-3 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Course Details
        </button>
        <h1 className="text-3xl font-bold">Course Videos</h1>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {videos.length} Videos
          </h2>
          <button
            onClick={() => navigate(`/courses/${courseId}/add-video`)}
            className="flex items-center gap-2 bg-primary-navy text-white px-4 py-2 rounded-lg hover:bg-primary-navy-light transition-colors shadow-lg shadow-primary-navy/20"
          >
            <Plus size={18} />
            Add Video
          </button>
        </div>

        {/* LIST */}
        {videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No videos yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start building your course content by adding your first video lesson.
            </p>
            <button
              onClick={() => navigate(`/courses/${courseId}/add-video`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-xl hover:bg-primary-navy-light transition shadow-lg shadow-primary-navy/20 font-medium"
            >
              <Plus size={18} />
              Add First Video
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div
                key={video.id || index}
                className="group bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 hover:shadow-lg transition-all duration-300"
              >
                {/* ORDER + THUMBNAIL */}
                <div className="relative w-40 h-24 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 group-hover:ring-2 ring-primary-navy/20 transition-all">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      alt={video.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Video size={32} className="text-slate-600" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <button
                      onClick={() => handlePlay(video.videoUrl)}
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-primary-navy hover:scale-110 hover:bg-white transition-all shadow-lg"
                      title="Play Video"
                    >
                      <Play size={20} className="ml-1" />
                    </button>
                  </div>

                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    #{video.orderIndex}
                  </span>

                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Clock size={10} />
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 truncate text-lg group-hover:text-primary-navy transition-colors">
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span
                      className={`px-2.5 py-1 rounded-full font-semibold border ${video.isPreview
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                    >
                      {video.isPreview ? "Free Preview" : "Locked Content"}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col justify-center gap-2 pl-4 border-l border-gray-100">
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Edit Video"
                  >
                    <FileText size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setPlayingVideo(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={32} />
          </button>

          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <video
              src={playingVideo}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseVideos;
