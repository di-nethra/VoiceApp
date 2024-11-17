import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

// Convert Base64 string back to Blob
const convertBase64ToBlob = (base64String) => {
  const matches = base64String.match(/^data:audio\/webm;base64,(.*)$/);
  if (!matches) {
    console.error('Invalid base64 string:', base64String);
    return null;
  }
  const base64 = matches[1]; // Extract the base64-encoded data part
  const byteCharacters = atob(base64); // Decode the base64 string to binary data
  const byteArrays = [];

  // Split binary data into chunks
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: 'audio/webm' });
};

// Function to play the audio
const playAudio = (base64Audio) => {
  const audioBlob = convertBase64ToBlob(base64Audio);
  if (audioBlob && audioBlob instanceof Blob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.error('Failed to play audio:', err);
    });
  } else {
    console.error('Invalid audioBlob or audioBlob is not a Blob:', audioBlob);
  }
};

const ReviewPage = () => {
  const loadPreviousRecordings = () => {
    const storedRecordings = JSON.parse(localStorage.getItem('recordings')) || [];
    return storedRecordings;
  };

  const [previousRecordings, setPreviousRecordings] = useState(loadPreviousRecordings());

  return (
    <div>
      <h1>Previous Reviews</h1>
      <ul>
        {previousRecordings.length === 0 ? (
          <p>No previous recordings found.</p>
        ) : (
          previousRecordings.map((recording, index) => (
            <li key={index}>
              <p>Transcript: {recording.transcript}</p>
              <Button onClick={() => playAudio(recording.audioBlob)} variant="contained">
                Play Audio
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ReviewPage;
