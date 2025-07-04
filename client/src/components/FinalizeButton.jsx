import { useState } from 'react';
import axios from '../services/api';

const FinalizeButton = ({ documentId }) => {
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    setLoading(true);
    try {
      console.log('Attempting to finalize doc:', documentId); // Debug log
      console.log('Using token:', localStorage.getItem('token')); // Debug log
      
      const response = await axios.post(
        `/signatures/${documentId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Finalize response:', response.data); // Debug log
      
      if (response.data.downloadLink) {
        window.open(response.data.downloadLink, '_blank');
      } else {
        console.error('No downloadLink in response');
      }
    } catch (error) {
      console.error('Finalize error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      alert(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleFinalize}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Finalize Document'}
    </button>
  );
};
// const FinalizeButton = ({ documentId }) => {
//   const [loading, setLoading] = useState(false);
//   const [downloadLink, setDownloadLink] = useState('');

//   const handleFinalize = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.post(`/signatures/${documentId}/finalize`);
//       setDownloadLink(data.downloadLink);
//       alert('Document finalized! Download available.');
//     } catch (error) {
//       console.error('Finalization failed:', error);
//       alert('Failed to finalize document');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-4">
//       <button 
//         onClick={handleFinalize}
//         disabled={loading}
//         className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
//       >
//         {loading ? 'Processing...' : 'Finalize Document'}
//       </button>
      
//       {downloadLink && (
//         <a 
//           href={downloadLink}
//           download
//           className="ml-4 text-blue-600 underline"
//         >
//           Download Signed PDF
//         </a>
//       )}
//     </div>
//   );
// };