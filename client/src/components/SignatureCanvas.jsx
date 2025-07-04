import {useRef, useState} from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({onSave, onCancel}) => {
    const sigCanvas = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleSave = () => {
        if(!sigCanvas.current.isEmpty) {
            const signatureData = sigCanvas.current.toDataURL();
            onSave(signatureData);
        }
    };

    try {
        const signatureData = sigCanvas.current.toDataURL('image/png');
        onSave(signatureData);
    } catch (error) {
        console.error('Error saving signature:', error);
        alert('Failed to save signature');
    }

    const handleClear = () => {
        sigCanvas.current.clear();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Sign Here</h3>
                <div className="border rounded-md mb-4">
                    <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: 500,
                        height: 200,
                        className: 'w-full bg-gray-100'
                    }}
                    onBegin={() => setIsDrawing(true)}
                    onEnd={() => setIsDrawing(false)}
                     />
                </div>

                <div className="flex justify-between">
                    <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-200 rounded"
                    disabled={!isDrawing}
                    >
                        Clear
                    </button>
                    <div className="space-x-2">
                        <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        >
                            Cancel
                        </button>
                        <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        disabled={!isDrawing}
                        >
                            Save Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignaturePad;