Frontend Side
Front side of this project was initialized using Vite, a modern frontend build tool that provides a fast development experience. The structure follows React best practices with components, routing, and state management.
The project uses a simple and clean structure:
React with hooks for state management
React Router for navigation
Vite as the build tool and development server
CSS for styling without external libraries
I keep the structure with a focus on two main components:
FileBrowser.jsx - For the home page showing root directories
FileViewer.jsx - For viewing and editing files and subdirectories
Component Design
The components are designed to be functional and use React hooks for managing state and side effects. Key features implemented include:
File/directory browsing with hierarchical navigation
File content viewing and editing
File/directory creation, deletion, and updating
Metadata display for files and directories
Sorting functionality (by name and size) thanks to the backend API
Search capabilities integrated with the backend s search endpoint

In here frontend communicates with the my backend using standard fetch API calls. I integrated all the API endpoints from the backend:
GET /api/v1/list-files/ - Lists files with optional path, query, and sorting parameters (in here we have a lot functionalities:D)
GET /api/v1/read-file/ - Reads file content
GET /api/v1/metadata/ - Gets metadata for files and directories
POST /api/v1/create-file/ - Creates new files
POST /api/v1/create-directory/ - Creates new directories
PUT /api/v1/update-file/ - Updates file content
DELETE /api/v1/delete-file/ - Deletes files or directories
Features and Implementation Details
Search and Sort: I merged search and sorting functionality into a single UI flow to simplify user experience (Just like the backend).

Examples of Component Features
FileBrowser - Lists root directories with options to create new ones
FileViewer - Provides file browsing, content viewing/editing, and metadata display
Both components support search, sort, and filter functionality

Deployment
For deploying to production, I built the project using npm run build
I face problem when i send static files to Google Cloud Storage, but i deploy project to another tool of gcp - firebase.