# Course Creation Workflow - Updated

## Overview
The course creation process has been redesigned to separate course details from video management, following the API structure more closely.

## New Workflow

### 1. **Create Course** (`/courses/create`)
   - **Page**: `CreateCourse.tsx`
   - **Purpose**: Create or edit course basic information
   - **Steps**:
     - **Step 1 - Basic Info**: Title, description, instructor, category, thumbnail
     - **Step 2 - Details**: Difficulty, duration, price, active status
     - **Step 3 - Review**: Preview all course information before saving
   
   - **After Saving**: Automatically redirects to the Course Videos page

### 2. **Manage Course Videos** (`/courses/:id/videos`)
   - **Page**: `CourseVideos.tsx`
   - **Purpose**: Add, edit, delete, and reorder videos for a specific course
   - **Features**:
     - Add new videos with title, description, URL, duration, thumbnail
     - Edit existing videos
     - Delete videos (with confirmation)
     - Reorder videos using up/down buttons
     - Upload videos via modal
     - Visual indicators for saved vs. unsaved videos
   
   - **After Saving**: Returns to the courses list

## Key Improvements

1. **Separation of Concerns**: Course details and videos are managed separately, matching the API structure
2. **Better UX**: Clear step-by-step process for course creation
3. **Cleaner Code**: Each page has a single responsibility
4. **API Alignment**: Follows the backend API structure:
   - `POST /api/Course/create` - Creates course
   - `POST /api/CourseVideo/create` - Creates course videos
   - `PUT /api/CourseVideo/update/{id}` - Updates videos
   - `DELETE /api/CourseVideo/delete/{id}` - Deletes videos

## Routes

- `/courses` - List all courses
- `/courses/create` - Create new course
- `/courses/edit/:id` - Edit existing course
- `/courses/:id/videos` - Manage videos for a course
- `/courses/:id` - View course details
- `/courses/:id/documents` - Manage course documents

## Files Modified/Created

### New Files
- `src/features/dashboard/pages/CreateCourse.tsx` - Course creation/editing page
- `src/features/dashboard/pages/CourseVideos.tsx` - Video management page

### Modified Files
- `src/routes/path.ts` - Added `courseVideos` path
- `src/routes/routes.tsx` - Added routes for CreateCourse and CourseVideos
- `src/features/dashboard/pages/Courses.tsx` - Removed modal, added navigation to CreateCourse

### Existing (Unchanged)
- `src/features/dashboard/pages/CourseForm.tsx` - Old combined form (can be removed if not needed)

## Usage

1. **To create a new course**:
   - Go to `/courses`
   - Click "Create Course" button
   - Fill in course details across 3 steps
   - Click "Create & Add Videos"
   - Add videos to the course
   - Click "Save All Videos"

2. **To edit an existing course**:
   - Go to `/courses/edit/:id`
   - Update course details
   - Click "Update & Continue"
   - Manage videos on the videos page

3. **To manage videos only**:
   - Go to `/courses/:id/videos`
   - Add, edit, delete, or reorder videos
   - Click "Save All Videos"
