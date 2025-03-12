
import { useState } from 'react';
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { ErrorType } from '@/utils/errors/types';
import { createAppError } from '@/utils/errors/error-factory';

const PAGE_SIZE = 50;

export const usePaginatedSearch = () => {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = async (
    lat: number,
    lng: number,
    radiusKm: number,
    filters: any = {}
  ) => {
    try {
      const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        page_number: page,
        page_size: PAGE_SIZE
      });

      if (error) throw error;

      // Update pagination state
      setHasMore(data && data.length >= PAGE_SIZE);
      
      return data as Application[];
    } catch (err) {
      throw createAppError(
        'Failed to fetch paginated results',
        err,
        { type: ErrorType.DATABASE }
      );
    }
  };

  const nextPage = () => setPage(p => p + 1);
  const resetPagination = () => {
    setPage(0);
    setHasMore(true);
  };

  return {
    page,
    hasMore,
    fetchPage,
    nextPage,
    resetPagination
  };
};
