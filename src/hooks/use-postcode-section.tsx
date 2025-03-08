
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export interface Postcode {
  id: number;
  postcode: string;
  radius?: string;
}

export const usePostcodeSection = () => {
  const [postcodes, setPostcodes] = useState<Postcode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showRadiusDialog, setShowRadiusDialog] = useState(false);
  const [selectedPostcode, setSelectedPostcode] = useState<string>('');
  const [selectedPostcodeId, setSelectedPostcodeId] = useState<number | null>(null);
  const [inputPostcode, setInputPostcode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPostcodes();
  }, []);

  const fetchPostcodes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_postcodes')
        .select('id, postcode, radius')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPostcodes(data || []);
    } catch (error) {
      console.error('Error fetching postcodes:', error);
      toast({
        title: "Error",
        description: "Failed to load postcodes",
        variant: "destructive",
      });
    }
  };

  const handleAddPostcode = async () => {
    const trimmedPostcode = inputPostcode.trim();
    if (!trimmedPostcode) {
      toast({
        title: "Error",
        description: "Please enter a valid postcode",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('user_postcodes')
        .insert({ 
          postcode: trimmedPostcode,
          user_id: user.id 
        });

      if (error) throw error;

      await fetchPostcodes();
      setShowAddNew(false);
      setInputPostcode('');
      toast({
        title: "Success",
        description: "Postcode has been added",
      });
    } catch (error) {
      console.error('Error adding postcode:', error);
      toast({
        title: "Error",
        description: "Failed to add postcode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePostcode = async (id: number) => {
    try {
      const { error } = await supabase
        .from('user_postcodes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPostcodes();
      toast({
        title: "Success",
        description: "Postcode has been removed",
      });
    } catch (error) {
      console.error('Error deleting postcode:', error);
      toast({
        title: "Error",
        description: "Failed to remove postcode",
        variant: "destructive",
      });
    }
  };

  const handleRadiusSubmit = async (radius: string) => {
    if (!selectedPostcodeId) return;
    
    try {
      const { error } = await supabase
        .from('user_postcodes')
        .update({ radius })
        .eq('id', selectedPostcodeId);

      if (error) throw error;

      await fetchPostcodes();
      setShowRadiusDialog(false);
      toast({
        title: "Success",
        description: `Alert radius updated for ${selectedPostcode}`,
      });
    } catch (error) {
      console.error('Error updating alert radius:', error);
      toast({
        title: "Error",
        description: "Failed to update alert radius",
        variant: "destructive",
      });
    }
  };

  return {
    postcodes,
    inputPostcode,
    isSubmitting,
    showAddNew,
    showEmailDialog,
    showRadiusDialog,
    selectedPostcode,
    selectedPostcodeId,
    setInputPostcode,
    setShowAddNew,
    setShowEmailDialog,
    setShowRadiusDialog,
    setSelectedPostcode,
    setSelectedPostcodeId,
    handleAddPostcode,
    handleDeletePostcode,
    handleRadiusSubmit
  };
};
