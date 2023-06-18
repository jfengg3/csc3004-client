import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './App.css';

interface JobMatch {
  id: number;
  title: string;
  company: string;
  description: string;
  joblink: string;
  compatibility: number;
}

const App: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<JobMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleResumeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedResume = event.target.files?.[0] || null;
    setResume(uploadedResume);
  };

  const handleSearch = async () => {
    if (!resume) {
      setErrorMessage('Please upload a resume file.');
      return; // Prevent search if resume is not uploaded
    }

    // Handle file extensions
    const allowedFileTypes = ['.pdf', '.docx', '.doc'];
    const fileExtension = resume.name.substring(resume.name.lastIndexOf('.')).toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      setErrorMessage('Invalid file type. Only PDF, DOCX, and DOC files are allowed.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    // Do backend logic
    try {
    
      const formData = new FormData();
      formData.append('resume', resume);

      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = response.data;

      if (responseData.results && Array.isArray(responseData.results)) {
        const results: JobMatch[] = responseData.results;
        setSearchResults(results);
        console.log('Succeed!')
      } else {
        console.log('Invalid response data:', responseData);
      }
      

    } catch (error) {
      console.log('Error occurred during search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Job Matcher App</h1>
      <h2 className="app-subtitle">Find the perfect job for you based on your skills</h2>

      {/* Resume Upload */}
      <div className="file-upload-container">
        <label className="file-upload-label">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="file-upload-input"
          />
          {resume ? `Uploaded Resume: ${resume.name}` : 'Upload Resume'}
        </label>
      </div>

      {/* Start Search Button */}
      <button
        onClick={handleSearch}
        disabled={!resume || loading}
        className={`search-button ${loading ? 'search-button--loading' : ''}`}
      >
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="search-button-icon" />
            Searching...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faSearch} className="search-button-icon" />
            Start Search
          </>
        )}
      </button>

      {/* Error Message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Loading Indicator */}
      {loading && <p className="loading-message">Loading...</p>}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results-container">
          <h2 className="search-results-title">Search Results</h2>
          {searchResults.map((result) => (
            <div key={result.id} className="job-card">
              <h3 className="job-title">{result.title}</h3>
              <p className="job-info">Company: {result.company}</p>
              <p className="job-info">Description: {result.description}</p>
              <p className="job-info job-link">
                Link: <a href={result.joblink}>{result.joblink}</a>
              </p>
              <p className="job-info job-compatibility">
                Compatibility: <span className="compatibility-score">{result.compatibility}%</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
