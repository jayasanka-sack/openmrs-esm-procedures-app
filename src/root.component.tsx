import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProceduresApp from './procedures-app.component';

const Root: React.FC = () => (
  <BrowserRouter basename={window.getOpenmrsSpaBase()}>
    <Routes>
      <Route path="procedures-app" element={<ProceduresApp />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
