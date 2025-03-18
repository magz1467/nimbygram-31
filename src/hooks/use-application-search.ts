import { useCallback, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface SearchResult {
  result: string
  error?: string
}

export const useApplicationSearch = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const searchApplication = useCallback(async (applicationNumber: string, council: string) => {
    setIsSearching(true)
    setSearchResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('search-planning-application', {
        body: { applicationNumber, council }
      })

      if (error) throw error

      setSearchResult(data as SearchResult)
    } catch (error) {
      console.error('Error searching application:', error)
      setSearchResult({ result: '', error: error.message })
    } finally {
      setIsSearching(false)
    }
  }, [])

  return {
    searchApplication,
    isSearching,
    searchResult
  }
}