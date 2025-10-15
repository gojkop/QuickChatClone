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

  // Fetch share kit templates
  const fetchShareTemplates = async () => {
    try {
      const response = await apiClient.get('/marketing/share-templates');
      setShareTemplates(response.data || []);
    } catch (err) {
      console.error('Failed to fetch share templates:', err);
      setError('Failed to load share templates');
      setShareTemplates([]);
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