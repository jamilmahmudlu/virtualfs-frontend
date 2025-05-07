import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FileBrowser = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [directories, setDirectories] = useState([]);
  
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortReverse, setSortReverse] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();



  const fetchDirectories = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/v1/list-files/`;
      
      url += `?sort_by=${encodeURIComponent(sortBy)}&reverse=${sortReverse}`;      
     if (searchVal) {
        url += `&query=${searchVal}`
      }
      
      const res = await fetch(url)
      const data = await res.json();
      
      if (data.items) {
        setDirectories(data.items)
      } else {
        setDirectories([])
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  };


  const openDirectory = (dirName) => {
    navigate(`/view?path=${dirName}`)
  };

  const createDirectory = async (e) => {
    e.preventDefault();
    if (!newItemName) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/create-directory/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: `/${newItemName}` }),
      });
      
      setNewItemName('');
      fetchDirectories();
    } catch (err) {
      console.log(err)
    }
  };


  const handleDelete = async (dirname) => {
    if (window.confirm(`Are you sure to delete ${dirname}?`)) {
      try {
       await fetch(
          `${API_BASE_URL}/api/v1/delete-file/?path=${dirname}`,
          {
            method: 'DELETE',
          }
        );
        fetchDirectories()
      } catch (err) {
        console.log(err)
      }
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    fetchDirectories()
  };

  const handleSort = (sort) => {
    if (sortBy === sort) {
      setSortReverse(s => !s);
    } else {
      setSortBy(sort);
      setSortReverse(false);
    }
    fetchDirectories()
  };

  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const queryPath = queryParams.get('path');
    if (queryPath) {
      setCurrentPath(`/${queryPath}`)
    }
    
    fetchDirectories()
  }, [currentPath, location.search]);

  return (
    <div className="file-browser">
      <h1>Virtual File System</h1>
      
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button type="submit">Search</button>
          <button onClick={() => {
            setSearchVal('')
            setSortBy('name')
            setSortReverse(false)
            fetchDirectories()
          }}>
            Reset
          </button>
        </form>
      </div>

      <div className="create-item-form">
        <form onSubmit={createDirectory}>
          <input
            type="text"
            placeholder="New folder name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            required
          />
          <button type="submit">Create Folder</button>
        </form>
      </div>

      {
        loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="directory-list">
          <div className="directory-list-header">
            <div className="header-item" onClick={() => handleSort('name')}>
              Directory Name {sortBy === 'name' && (sortReverse ? '▼' : '▲') } (for ordering)
            </div>
            <div className="header-item" onClick={() => handleSort('size')}>
              Action 
            </div>
          </div>

              {
                directories.length === 0 ? (
            <div className="empty-directory">
              No folder found
            </div>
          ) : (
            directories.map((dirName, idx) => (
              <div key={idx} className="directory-item">
                <div 
                  className="directory-name"
                  onClick={() => openDirectory(dirName)}
                >
                  📁 {dirName}
                </div>
                <div className="directory-actions">
                  <button 
                    onClick={() => handleDelete(dirName)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FileBrowser; 