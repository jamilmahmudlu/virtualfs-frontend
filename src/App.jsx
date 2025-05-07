import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer';


function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<FileBrowser />} />
          <Route path="/view" element={<FileViewer />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
