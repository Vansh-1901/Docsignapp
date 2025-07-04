import { useState } from 'react';
import Draggable from 'react-draggable';
import SignaturePad from './SignatureCanvas';
import axios from 'axios';

const SignatureField = ({ signature, pageDimensions, onSignComplete }) => {
  const [showPad, setShowPad] = useState(false);
  const [position, setPosition] = useState({
    x: (signature.x / 100) * pageDimensions.width,
    y: (signature.y / 100) * pageDimensions.height
  });

  const handleDrag = (e, data) => {
    const xPercent = (data.x / pageDimensions.width) * 100;
    const yPercent = (data.y / pageDimensions.height) * 100;
    // You would call an API here to update the position in the backend
    axios.put(`/signatures/${signature._id}`, {x: newX, y: newY});
    // Update UI
    setPosition({ x: data.x, y: data.y });
  };

  const handleSign = () => {
    setShowPad(true);
  };

  return (
    <>
      <Draggable
        position={position}
        onDrag={handleDrag}
        bounds="parent"
      >
        <div
          className={`signature-field ${signature.status === 'signed' ? 'signed' : 'unsigned'}`}
          onClick={handleSign}
          style={{
            width: `${(signature.width / 100) * pageDimensions.width}px`,
            height: `${(signature.height / 100) * pageDimensions.height}px`
          }}
        >
          {signature.status === 'signed' ? '✓ Signed' : 'Click to Sign'}
        </div>
      </Draggable>

      {showPad && (
        <SignaturePad
          onSave={(signatureData) => {
            onSignComplete(signature._id, signatureData);
            setShowPad(false);
          }}
          onCancel={() => setShowPad(false)}
        />
      )}
    </>
  );
};

export default SignatureField;