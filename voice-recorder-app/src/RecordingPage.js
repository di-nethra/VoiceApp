import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaMicrophoneAltSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Modal, Box, Button, Typography, CircularProgress } from '@mui/material';

const RecordingPage = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [openModal, setOpenModal] = useState(false); // Modal state
  const navigate = useNavigate();

  // Convert Blob to Base64 string before storing
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // Result will be a data URL (base64 string)
      reader.onerror = reject;
      reader.readAsDataURL(blob); // This will result in base64 string with 'data:audio/webm;base64,...'
    });
  };

  // Start/Stop recording audio using MediaRecorder
  const toggleRecording = () => {
    if (listening) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      SpeechRecognition.stopListening();
      setOpenModal(false); // Close modal when recording stops
    } else {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            const chunks = [];
            recorder.ondataavailable = (event) => {
              chunks.push(event.data);
            };
            recorder.onstop = () => {
              const audioBlob = new Blob(chunks, { type: 'audio/webm' });
              setAudioBlob(audioBlob);
            };
            recorder.start();
          })
          .catch(err => {
            console.error('Failed to start recording:', err);
          });
      }
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      setOpenModal(true); // Open modal when recording starts
    }
  };

  // Save transcript and audio to localStorage
  const handleSubmit = async () => {
    if (audioBlob) {
      const base64Audio = await convertBlobToBase64(audioBlob);
      const newRecording = { transcript, audioBlob: base64Audio };
      const storedRecordings = JSON.parse(localStorage.getItem('recordings')) || [];
      const updatedRecordings = [...storedRecordings, newRecording];
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings));
    }
    navigate('/review');
  };


  return (
    <div>

      <button onClick={toggleRecording} className="mic-button">
        {listening ? (
          <FaMicrophoneAltSlash size={20} /> 
        ) : (
          <FaMicrophone size={20} /> 
        )}
      </button>
      <button onClick={handleSubmit} disabled={!audioBlob}>
        Submit Review
      </button>
      <p>Transcript: {transcript}</p>


      {/* Modal for showing "Listening..." and stop button */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="listening-modal-title"
        aria-describedby="listening-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="listening-modal-title" variant="h6" component="h2">
            Listening...
          </Typography>
          <CircularProgress sx={{ margin: '20px' }} />
          <Button
            variant="contained"
            color="error"
            onClick={toggleRecording}
            sx={{ marginTop: '20px' }}
          >
            Stop Recording
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  backgroundColor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  padding: '20px',
  textAlign: 'center',
};

export default RecordingPage;
