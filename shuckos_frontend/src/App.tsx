import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return <Dashboard />;
}
