import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {useNavigate} from 'react-router';
import { UploadCloud, Loader2, CheckCircle, X } from 'lucide-react';

const UploadButton = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const cancelToken = useRef(null);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('document', file);

    cancelToken.current = axios.CancelToken.source();

    try {
      const response = await axios.post('/docs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        cancelToken: cancelToken.current.token,
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      toast.success(`${file.name} uploaded successfully!`);
      setUploadSuccess(true);
      navigate(`/documents/${response.data._id}`);
      onUploadSuccess?.(response.data);
      //window.location.href = `/documents/${data._id}`;

    } catch (error) {
      if (axios.isCancel(error)) {
        toast('Upload cancelled');
      } else {
        handleUploadError(error);
      }
    } finally {
      if (!uploadSuccess) {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }, [navigate, onUploadSuccess]);

  const handleUploadError = (error) => {
    let errorMessage = 'Upload failed';
    
    if (error.response) {
      if (error.response.status === 413) {
        errorMessage = 'File too large (max 10MB)';
      } else if (error.response.status === 401) {
        errorMessage = 'Session expired - please login again';
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        errorMessage = error.response.data?.message || 
                      `Server error (${error.response.status})`;
      }
    } else if (error.request) {
      errorMessage = 'Network error - please check your connection';
    }
    
    toast.error(errorMessage);
  };

  const cancelUpload = () => {
    if (cancelToken.current) {
      cancelToken.current.cancel();
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
    noClick: isUploading
  });

  return (
    <div 
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300'}
        ${isUploading ? 'opacity-90' : 'hover:border-blue-300'}
      `}
    >
      <input {...getInputProps()} aria-label="PDF file upload" accept=".pdf" />
      
      {uploadSuccess ? (
        <div className="space-y-2">
          <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
          <p className="font-medium">Upload complete!</p>
          <p className="text-sm text-gray-500 truncate">{fileName}</p>
        </div>
      ) : isUploading ? (
        <div className="space-y-3">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
          <p className="font-medium">Uploading {fileName}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{uploadProgress}%</p>
          <button 
            onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
            className="flex items-center justify-center gap-1 mx-auto text-sm text-red-500 hover:text-red-700"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <UploadCloud className="w-8 h-8 mx-auto text-gray-500" />
          <p className="font-medium">
            {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF, or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            PDF only (max 10MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadButton;