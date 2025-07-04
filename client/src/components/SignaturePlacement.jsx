import {useState} from 'react';
import signatureCanvas from './SignatureCanvas';

const SignaturePlacement = ({
    documentId,
    pageNumber,
    pageDimentions,
    onPlaceSignature,
    onSignComplete
}) => {
    const [position, setPosition] = useState({x:50, y:50});
    const [isPlacing, setIsPlacing] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);

    const handlePlaceSignatures = () => {
        if(!isPlacing) {
            setIsPlacing(true);
            return;
        }

        // Convert to percentage-based coordinates
        const signatureData = {
            documentId,
            pageNumber,
            x: position.x,
            y: position.y,
            width: 20
        } ;

        onPlaceSignature(signatureData);
        setIsPlacing(false);
        setShowCanvas(true);
    };

    const handlePositionChange = (e) => {
        if(!isPlacing) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPosition({x,y});
    };

    return (
        <div className="relative w-full h-full">
            {isPlacing && (
                <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50"
                style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    width: '20%',
                    height: '10%',
                    transform: 'translate(-50%, -50%)'
                }} 
                />
            )}

            <div 
            className="absolute inset-0"
            onClick={handlePositionChange}
            style={{cursor: isPlacing ? 'crosshair' : 'default'}} 
            />

            <button 
            onClick={handlePlaceSignatures}
            className={`absolute top-4 right-4 z-10 px-4 py-2 rounded ${isPlacing ? 'bg-green-500' : 'bg-blue-500'} text-white`}
            >
                {isPlacing ? 'Place Here' : 'Add Signature'}
            </button>

            {showCanvas && (
                <signatureCanvas
                onSave={(signatureData) => {
                    onSignComplete(signatureData);
                    setShowCanvas(false);
                }}
                onCancel={() => setShowCanvas(false)}
                />
            )}
        </div>
    );
};

export default SignaturePlacement;