import { useState } from 'react';
import './index.css';

// Simple Icon Components
const IconImage = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
const IconSearch = ({ size = 24, color = 'currentColor', style }) => (
  <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const IconLoader = ({ size = 24, className, style }) => (
  <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
);
const IconCheckCircle = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const IconFolderOpen = ({ size = 24, style }) => (
  <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const IconAlertCircle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

function App() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, scraping, ready, downloading, success, error
  const [errorDetails, setErrorDetails] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;

    setStatus('scraping');
    setImages([]);
    setErrorDetails('');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape information');
      }

      if (data.images && data.images.length > 0) {
        setImages(data.images);
        setStatus('ready');
      } else {
        throw new Error('No images found on the provided URL');
      }

    } catch (err) {
      setStatus('error');
      setErrorDetails(err.message);
    }
  };

  const downloadToFolder = async () => {
    if (!window.showDirectoryPicker) {
      setErrorDetails("Your browser doesn't support picking a folder directly. Please use Chrome, Edge, or Opera.");
      setStatus('error');
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      setStatus('downloading');
      setDownloadProgress(0);

      let successCount = 0;
      const total = images.length;

      for (let i = 0; i < total; i++) {
        const imgUrl = images[i];
        try {
          // Fetch via proxy to avoid CORS
          const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imgUrl)}`);
          if (!response.ok) continue;

          const blob = await response.blob();

          // Get filename
          let filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
          // Clean filename
          filename = filename.split(/[?#]/)[0] || `image_${i}.jpg`;
          if (!filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            filename += '.jpg'; // detection fallback
          }

          // Create file handle
          const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();

          successCount++;
        } catch (err) {
          console.warn(`Failed to save ${imgUrl}`, err);
        }

        setDownloadProgress(Math.round(((i + 1) / total) * 100));
      }

      setStatus('success');
      setErrorDetails(`Successfully saved ${successCount} images to the selected folder.`);

    } catch (err) {
      // User cancelled or error
      if (err.name !== 'AbortError') {
        setStatus('error');
        setErrorDetails(err.message);
      }
    }
  };

  return (
    <div className="container" style={{ margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%' }}>
            <IconImage size={32} color="#60a5fa" />
          </div>
        </div>

        <h1>Image Scraper</h1>
        <p className="subtitle">Extract and save high-quality images from any website.</p>

        <form onSubmit={handleScrape}>
          <div className="input-group">
            <label htmlFor="url-input">Website URL</label>
            <div>
              <div style={{ position: 'relative' }}>
                <input
                  id="url-input"
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <IconSearch
                  size={18}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn"
            disabled={status === 'scraping' || status === 'downloading'}
          >
            {status === 'scraping' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconLoader className="animate-spin" size={20} style={{ marginRight: '8px' }} />
                Scraping...
              </div>
            ) : 'Finding Images'}
          </button>
        </form>

        {status === 'ready' && (
          <div className="status-box">
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <IconCheckCircle size={18} color="#4ade80" />
              Found {images.length} images!
            </p>
            <button className="btn btn-secondary" onClick={downloadToFolder}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconFolderOpen size={18} style={{ marginRight: '8px' }} />
                Choose Folder & Save All
              </div>
            </button>
          </div>
        )}

        {status === 'downloading' && (
          <div className="status-box">
            <p>Saving images to your device...</p>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${downloadProgress}%` }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.5rem' }}>{downloadProgress}%</p>
          </div>
        )}

        {status === 'success' && (
          <div className="status-box" style={{ borderColor: '#4ade80', borderWidth: '1px', borderStyle: 'solid', background: 'rgba(74, 222, 128, 0.1)' }}>
            <p style={{ color: '#4ade80', fontWeight: 'bold' }}>Success!</p>
            <p>{errorDetails}</p>
            <button className="btn btn-secondary" onClick={() => { setStatus('idle'); setUrl(''); }} style={{ marginTop: '1rem' }}>
              Scrape Another
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="status-box" style={{ borderColor: '#f87171', borderWidth: '1px', borderStyle: 'solid', background: 'rgba(248, 113, 113, 0.1)' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 'bold' }}>
              <IconAlertCircle size={18} />
              Error
            </p>
            <p style={{ color: '#fca5a5' }}>{errorDetails}</p>
            <button className="btn btn-secondary" onClick={() => setStatus('idle')} style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Gallery Preview */}
      {images.length > 0 && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Preview ({images.length})</h3>
            {status === 'ready' && (
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem' }}
                onClick={() => setImages([])}
              >
                Clear
              </button>
            )}
          </div>
          <div className="gallery">
            {images.map((img, idx) => (
              <div key={idx} className="img-preview">
                <img src={img} alt={`Scraped ${idx}`} loading="lazy" onError={(e) => e.target.style.display = 'none'} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
