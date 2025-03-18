import React from 'react';
import { ProfileSettings } from '@/components/ProfileSettings';

const Profile: React.FC = () => {
  // Mock user profile data
  const userProfile = {
    id: 'user123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    notificationPreferences: {
      email: true,
      push: false,
      sms: true
    },
    savedLocations: [
      {
        id: 'loc1',
        name: 'Home',
        address: '123 Home Street, London, SW1A 1AA'
      },
      {
        id: 'loc2',
        name: 'Work',
        address: '456 Office Road, London, EC1A 1BB'
      }
    ]
  };

  const handleSaveProfile = (updatedProfile) => {
    console.log('Profile updated:', updatedProfile);
    // In a real app, you would save this to your backend
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Your Profile</h1>
        
        <ProfileSettings 
          profile={userProfile}
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
};

export default Profile;