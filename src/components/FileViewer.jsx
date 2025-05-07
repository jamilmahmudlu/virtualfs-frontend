import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FileViewer = () => {
  const [directoryName, setDirectoryName] = useState('');
  const [items, setItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [saving, setSaving] = useState(false);  
  const [directoryMetadata, setDirectoryMetadata] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  
  const [newItemName, setNewItemName] = useState('');
  
  const [searchVal, setSearchVal] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortReverse, setSortReverse] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let dirName = queryParams.get('path');
    let fileName;


    if (dirName) {
      const splitted = dirName.split('/')
      const last = splitted.pop()
      if (last?.includes('.txt')) {
        fileName = last.slice(0)
        dirName = splitted.join('/');
      }
      
      setDirectoryName(dirName);

      getDirectoryItems(dirName);      

      getDirectoryMetadata(dirName);

      if (fileName) {
        loadFile(queryParams.get('path'))
      }
      
    } else {
      navigate('/');
    }
  }, [location.search]);


  const getDirectoryItems = async (dirName) => {
    try {
      setLoading(true);
      
      let url = `${API_BASE_URL}/api/v1/list-files/?path=${dirName}`;      
      url += `&sort_by=${sortBy}&reverse=${sortReverse}`;      
      if (searchVal) {
        url += `&query=${searchVal}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.items) {
        if (searchVal) {
          setItems(data.items);
        } else {
          setItems(data.items);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const isFile = (name) => {
    return name.endsWith('.txt');
  };

  const loadFile = async (fileName) => {
    const filePath = fileName.includes('/')  ? fileName :`${directoryName}/${fileName}`;
    try {
      setContentLoading(true);
      setSelectedFile(fileName);
      
      const res = await fetch(
        `${API_BASE_URL}/api/v1/read-file/?path=${filePath}`
      );
      const data = await res.json();
      
      if (data.content) {
        setFileContent(data.content);
      } else {
        setFileContent('');
      }
      
      await getFileMetadata(filePath);
    } catch (err) {
      console(err)
    } finally {
      setContentLoading(false);
    }
  };

  const getFileMetadata = async (filePath) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/metadata/?path=${filePath}`
      );
      const data = await res.json();
      
      if (data.metadata) {
        setFileMetadata(data.metadata);
      }
    } catch (err) {
      console.log(err)
    }
  };

  const getDirectoryMetadata = async (dirPath) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/metadata/?path=${dirPath}`
      );
      const data = await res.json()
      
      if (data.metadata) {
        setDirectoryMetadata(data.metadata)
      }
    } catch (err) {
      console.log(err)
    }
  };

  const updateFile = async () => {
    if (!selectedFile) return;
    
    const filePath = selectedFile.includes('/') ? selectedFile :`${directoryName}/${selectedFile}`;
    
    try {
      setSaving(true);      
      await fetch(`${API_BASE_URL}/api/v1/update-file/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: filePath, content: fileContent }),
      });
      
      getFileMetadata(filePath);
    } catch (err) {
      console.log(err)
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName) return;

    const isFile = newItemName.endsWith('.txt');
    if (!isFile) {
      setNewItemName(newItemName + '.txt');
      return;
    }

    try {
      const path = `${directoryName}/${newItemName}`;      
      await fetch(`${API_BASE_URL}/api/v1/create-file/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path, content: '' }),
      });
      
      
      setNewItemName('');
      getDirectoryItems(directoryName);
    } catch (err) {
      console.log(err)
    }
  };

  const createSubdirectory = async () => {
    if (!newItemName) return;
    
    if (newItemName.includes('.')) {
      alert('Not a valid directory name');
      return;
    }
    
    try {
      const path = `${directoryName}/${newItemName}`;
      
      await fetch(`${API_BASE_URL}/api/v1/create-directory/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      });
      
      
      setNewItemName('');
      getDirectoryItems(directoryName);
    } catch (err) {
      console.log(err)
    }
  };

  const clickItem = (item) => {
    if (item.startsWith('/')) {
      if (item.endsWith('.txt')) {
        const lastSlashIndex = item.lastIndexOf('/');
        const parentDir = item.substring(0, lastSlashIndex);
        navigate(`/view?path=${parentDir || '/'}`);
      } else {
        navigate(`/view?path=${item}`);
      }
    } else {
      if (isFile(item)) {
        loadFile(item);
      } else {
        navigate(`/view?path=${directoryName}/${item}`);
      }
    }
  };

  const deleteItem = async (itemName) => {
    const isFullPath = itemName.startsWith('/');
    
    let path;
    let displayName;
    
    if (isFullPath) {
      path = itemName;
      displayName = itemName;
    } else {
      path = `${directoryName}/${itemName}`;
      displayName = itemName;
    }
    
    const isFile = isFile(itemName);
    if (!confirm(`Are you sure you want to delete this ${isFile ? 'file' : 'directory'}?\n${displayName}`)) {
      return;
    }

    try {
      
      await fetch(`${API_BASE_URL}/api/v1/delete-file/?path=${path}`,
        { method: "DELETE" }
      );
            
      if (selectedFile === (isFullPath ? itemName.split('/').pop() : itemName)) {
        setSelectedFile(null);
        setFileContent('');
        setFileMetadata(null);
      }
      
      getDirectoryItems(directoryName);
      getDirectoryMetadata(directoryName);
    } catch (err) {
      console.log(err);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const handleSortChange = (newSortby) => {
    if (sortBy === newSortby) {
      setSortReverse(!sortReverse);
    } else {
      setSortBy(newSortby);
      setSortReverse(false);
    }
    getDirectoryItems(directoryName);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getDirectoryItems(directoryName);
  };



  const resetSearch = () => {
    setSearchVal('');
    setSortBy('name');
    setSortReverse(false);
    getDirectoryItems(directoryName);
  };

  return (
    <div className="file-viewer">
      <h1>Directory: {directoryName}</h1>
      
      <button onClick={goBack} className="back-button">
        Back to Home
      </button>
      
      {directoryMetadata && (
        <div className="folder-metadata">
          <h3>Folder Information</h3>
          <div className="metadata-content">
            <p>Name: {directoryMetadata.name}</p>
            <p>Created: {directoryMetadata.created ? new Date(directoryMetadata.created).toLocaleString() : 'N/A'}</p>
            <p>Updated: {directoryMetadata.updated ? new Date(directoryMetadata.updated).toLocaleString() : 'N/A'}</p>
            <p>Items: {directoryMetadata.item_count !== undefined ? `${directoryMetadata.item_count} items` : 'N/A'}</p>
          </div>
        </div>
      )}
      
      <div className="directory-content">
        <div className="items-panel">
          <div className="search-sort-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <button type="submit">Search</button>
              <button onClick={resetSearch} type="button">
                Reset
              </button>
            </form>
            
            <div className="sort-controls">
              <span>Sort by: </span>
              <button 
                onClick={() => handleSortChange('name')}
                className={sortBy === 'name' ? 'active' : ''}
              >
                Name {sortBy === 'name' && (sortReverse ? '↓' : '↑')}
              </button>
              <button 
                onClick={() => handleSortChange('size')}
                className={sortBy === 'size' ? 'active' : ''}
              >
                Size {sortBy === 'size' && (sortReverse ? '↓' : '↑')}
              </button>
            </div>
          </div>

          <div className="create-item-form">
            <form onSubmit={handleCreateItem}>
              <input
                type="text"
                placeholder="New file or directory name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <button type="submit">Create File</button>
              <button type="button" onClick={createSubdirectory}>Create Folder</button>
            </form>
          </div>
          
          {loading ? (
            <div className="loading">Loading directory contents...</div>
          ) : (
            <div className="items-list">
              <h3>Files and Folders</h3>
              {items.length === 0 ? (
                <div className="empty-directory">Directory is empty</div>
              ) : (
                <ul>
                  {items.map((item, index) => {
                    const isFullPath = item.startsWith('/');
                    const displayName = isFullPath ? item : item;
                    
                    return (
                      <li key={index} className="item-entry">
                        <span 
                          className={`item-name ${
                            selectedFile === (item.startsWith('/') ? item.split('/').pop() : item) ? 'selected' : ''
                          }`}
                          onClick={() => clickItem(item)}
                        >
                          {isFile(item) ? '📄' : '📁'} {displayName}
                        </span>
                        <button 
                          onClick={() => deleteItem(item)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
        
        {
          selectedFile && (
          <div className="file-content-panel">
            <div className="file-header">
              <h3>File: {selectedFile}</h3>
              <button 
                onClick={updateFile} 
                disabled={contentLoading || saving}
                className="save-button"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            
            {
              fileMetadata && 
              <div className="file-metadata">
                <p>Name: {fileMetadata?.name}</p>
                <p>Created: {fileMetadata.created ? new Date(fileMetadata.created).toLocaleString() : 'N/A'}</p>
                <p>Updated: {fileMetadata.updated ? new Date(fileMetadata.updated).toLocaleString() : 'N/A'}</p>
                <p>Size: {`${fileMetadata?.size} bytes`}</p>
              </div>
              
            }
            
            {contentLoading ? (
              <div className="loading">Loading file content...</div>
            ) : (
              <textarea
                className="file-content"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={15}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer; 