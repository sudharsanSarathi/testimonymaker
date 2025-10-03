import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// Instant Redirect Component to Main Landing Page
export function CreateTestimonialPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediate redirect without showing any message
    navigate('/', { replace: true });
  }, [navigate]);

  // No fallback content - immediate redirect
  return null;
}