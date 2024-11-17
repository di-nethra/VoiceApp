import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecordingPage from './RecordingPage';
import ReviewPage from './ReviewPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecordingPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
};

export default App;
