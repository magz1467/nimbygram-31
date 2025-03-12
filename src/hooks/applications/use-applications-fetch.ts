
import { useState } from 'react';
import { Application } from "@/types/planning";
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errors/centralized-handler';

/**
 * Transform application data to ensure proper format
 */
export function transformApplicationData(applications: any[]): Application[] {
  return applications.map(app => ({
    id: app.id,
    reference: app.reference || '',
    address: app.address || '',
    title: app.title || 'No title available',
    description: app.description || 'No description available',
    status: app.status || 'Unknown',
    coordinates: app.coordinates || null,
    date_received: app.date_received || null,
    date_validated: app.date_validated || null,
    decision_date: app.decision_date || null,
    distance: app.distance || null,
    applicant: app.applicant || '',
    classification: app.classification || '',
    council: app.council || '',
    image_url: app.image_url || '',
    document_url: app.document_url || '',
    source_url: app.source_url || '',
    external_url: app.external_url || '',
    latitude: app.latitude || null,
    longitude: app.longitude || null,
    impact_score: app.impact_score || null,
    appeal_status: app.appeal_status || null,
    committee_date: app.committee_date || null,
    consultation_end: app.consultation_end || null,
    decision_issued: app.decision_issued || null,
    documents: app.documents || [],
    proposal: app.proposal || '',
    agent: app.agent || '',
    ward: app.ward || ''
  }));
}

export function useApplicationsFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = async (params: any): Promise<Application[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('crystal_roof')
        .select('*')
        .limit(params.limit || 10)
        .order(params.orderBy || 'date_received', { ascending: false });

      if (error) throw error;
      
      return transformApplicationData(data || []);
    } catch (err) {
      handleError(err);
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchApplications,
    loading,
    error
  };
}
