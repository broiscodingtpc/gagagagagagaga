import { useState, useEffect } from 'react';

interface LearningStatus {
  isLearning: boolean;
  totalLessons: number;
  recentLessons: any[];
  topics: string[];
  averageEngagement: number;
}

export function useLearningStatus() {
  const [learningStatus, setLearningStatus] = useState<LearningStatus>({
    isLearning: false,
    totalLessons: 0,
    recentLessons: [],
    topics: [],
    averageEngagement: 0
  });

  useEffect(() => {
    const fetchLearningStatus = async () => {
      try {
        const response = await fetch('/api/learning/status');
        if (response.ok) {
          const data = await response.json();
          setLearningStatus({
            isLearning: data.learning?.isLearning || false,
            totalLessons: data.learning?.totalLessons || 0,
            recentLessons: data.learning?.recentLessons || [],
            topics: data.learning?.topics || [],
            averageEngagement: data.learning?.averageEngagement || 0
          });
        }
      } catch (error) {
        console.error('Error fetching learning status:', error);
      }
    };

    // Fetch immediately
    fetchLearningStatus();

    // Poll every 30 seconds for learning status
    const interval = setInterval(fetchLearningStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return learningStatus;
}
