import { useState, useEffect } from 'react';
import apiClient from '@/api';

export function useMarketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [shareTemplates, setShareTemplates] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await apiClient.get('/marketing/campaigns');
      setCampaigns(response.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      // For MVP, use mock data if API fails
      setCampaigns([
        {
          id: 1,
          name: "LinkedIn Launch Post",
          utm_source: "linkedin",
          utm_campaign: "q4_launch",
          url: "mindpick.com/you?utm_source=linkedin&utm_campaign=q4_launch",
          total_visits: 342,
          total_questions: 14,
          total_revenue: 1680,
          conversion_rate: 4.1,
          status: "active",
          created_at: "2025-10-01"
        }
      ]);
    }
  };

  // Fetch traffic sources breakdown
  const fetchTrafficSources = async () => {
    try {
      const response = await apiClient.get('/marketing/traffic-sources');
      setTrafficSources(response.data || []);
    } catch (err) {
      console.error('Failed to fetch traffic sources:', err);
      setTrafficSources([
        { name: "LinkedIn", visits: 342, questions: 14, revenue: 1680 },
        { name: "Twitter", visits: 521, questions: 18, revenue: 2160 },
        { name: "Email", visits: 128, questions: 9, revenue: 1080 }
      ]);
    }
  };

  // Fetch share kit templates
  const fetchShareTemplates = async () => {
    try {
      const response = await apiClient.get('/marketing/share-templates');
      setShareTemplates(response.data || []);
    } catch (err) {
      console.error('Failed to fetch share templates:', err);
      setShareTemplates([
        {
          id: 1,
          title: "Twitter Thread Starter",
          platform: "twitter",
          copy: "I've been overwhelmed by \"can I pick your brain?\" DMs...\n\nMy link: mindpick.com/you"
        }
      ]);
    }
  };

  // Fetch insights and recommendations
  const fetchInsights = async () => {
    try {
      const response = await apiClient.get('/marketing/insights');
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setInsights({
        your_metrics: { visit_to_question: 4.2 },
        platform_average: { visit_to_question: 3.2 },
        insights: []
      });
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
        fetchShareTemplates(),
        fetchInsights()
      ]);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  return {
    campaigns,
    trafficSources,
    shareTemplates,
    insights,
    isLoading,
    error,
    createCampaign,
    refreshCampaigns: fetchCampaigns,
    refreshTrafficSources: fetchTrafficSources
  };
}