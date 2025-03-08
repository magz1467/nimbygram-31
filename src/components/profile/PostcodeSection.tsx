
import { useState } from 'react';
import { EmailDialog } from '@/components/EmailDialog';
import { RadiusDialog } from './RadiusDialog';
import { AddPostcode } from './AddPostcode';
import { PostcodeList } from './postcodes/PostcodeList';
import { usePostcodeSection } from '@/hooks/use-postcode-section';

interface PostcodeSectionProps {
  initialPostcode?: string;
  onPostcodeUpdate: (postcode: string) => Promise<void>;
}

export const PostcodeSection = ({ 
  initialPostcode = ''
}: PostcodeSectionProps) => {
  const {
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
  } = usePostcodeSection();

  const handleEmailSubmit = async (radius: string) => {
    try {
      await handleRadiusSubmit(radius);
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Error updating email alert radius:', error);
    }
  };

  return (
    <div>
      <div className="space-y-1">
        <label className="text-sm text-gray-500">Post Codes</label>
        <p className="text-sm text-gray-500">These are the postcodes you want to be kept aware of for planning applications</p>
      </div>
      
      <PostcodeList 
        postcodes={postcodes}
        showAddNew={showAddNew}
        onAddClick={() => setShowAddNew(true)}
        onDelete={handleDeletePostcode}
        onAlertClick={(postcode, id) => {
          setSelectedPostcode(postcode);
          setSelectedPostcodeId(id);
          setShowRadiusDialog(true);
        }}
      />

      {showAddNew && (
        <AddPostcode
          postcode={inputPostcode}
          isSubmitting={isSubmitting}
          onPostcodeSelect={setInputPostcode}
          onSubmit={handleAddPostcode}
        />
      )}

      <EmailDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailSubmit}
        postcode={selectedPostcode}
      />

      <RadiusDialog
        open={showRadiusDialog}
        onOpenChange={setShowRadiusDialog}
        onSubmit={handleRadiusSubmit}
        postcode={selectedPostcode}
      />
    </div>
  );
};
