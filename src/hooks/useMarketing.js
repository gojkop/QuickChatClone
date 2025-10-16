// src/hooks/useMarketing.js
import { useState, useEffect } from 'react';
import apiClient from '@/api';

export function useMarketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [insights, setInsights] = useState(null);
  const [expertProfile, setExpertProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await apiClient.get('/marketing/campaigns');
      setCampaigns(response.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load campaigns');
      setCampaigns([]);
    }
  };

  // Fetch traffic sources breakdown
  const fetchTrafficSources = async () => {
    try {
      const response = await apiClient.get('/marketing/traffic-sources');
      setTrafficSources(response.data || []);
    } catch (err) {
      console.error('Failed to fetch traffic sources:', err);
      setError('Failed to load traffic sources');
      setTrafficSources([]);
    }
  };

  // Fetch insights and recommendations
  const fetchInsights = async () => {
    try {
      const response = await apiClient.get('/marketing/insights');
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError('Failed to load insights');
      setInsights(null);
    }
  };

  // Fetch expert profile data (for Share Kit templates)
  const fetchExpertProfile = async () => {
    try {
      // Assuming you have an endpoint to get current expert's profile
      const response = await apiClient.get('/me/profile');
      setExpertProfile(response.data);
      setUser(response.data.user); // Assuming user is nested
      
      // Calculate stats from questions
      const questionsResponse = await apiClient.get('/me/questions');
      const questions = questionsResponse.data || [];
      
      const answeredQuestions = questions.filter(q => 
        q.status === 'answered' || q.status === 'closed'
      );
      
      const totalRating = answeredQuestions.reduce((sum, q) => sum + (q.rating || 0), 0);
      const avgRating = answeredQuestions.length > 0 
        ? (totalRating / answeredQuestions.length).toFixed(1) 
        : '5.0';
      
      setStats({
        total_questions: answeredQuestions.length,
        avg_rating: avgRating,
      });
    } catch (err) {
      console.error('Failed to fetch expert profile:', err);
      // Non-critical error, Share Kit will show loading state
    }
  };

  // Create new campaign
  const createCampaign = async (campaignData) => {
    try {
      const response = await apiClient.post('/marketing/campaigns', campaignData);
      await fetchCampaigns(); // Refresh list
      return response.data;
    } catch (err) {
      console.error('Failed to create campaign:', err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCampaigns(),
        fetchTrafficSources(),
        fetchInsights(),
        fetchExpertProfile(),
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  return {
    campaigns,
    trafficSources,
    insights,
    expertProfile,
    user,
    stats,
    isLoading,
    error,
    createCampaign,
    refreshCampaigns: fetchCampaigns,
    refreshTrafficSources: fetchTrafficSources,
  };
}