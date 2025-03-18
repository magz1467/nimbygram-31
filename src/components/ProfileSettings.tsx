import React, { useState, FormEvent } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  savedLocations: Array<{
    id: string;
    name: string;
    address: string;
  }>;
}

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onSave,
  isLoading = false,
  error = null
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [email, setEmail] = useState<string>(profile.email);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    profile.notificationPreferences.email
  );
  const [pushNotifications, setPushNotifications] = useState<boolean>(
    profile.notificationPreferences.push
  );
  const [smsNotifications, setSmsNotifications] = useState<boolean>(
    profile.notificationPreferences.sms
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const updatedProfile: UserProfile = {
      ...profile,
      name,
      email,
      notificationPreferences: {
        email: emailNotifications,
        push: pushNotifications,
        sms: smsNotifications
      }
    };
    
    onSave(updatedProfile);
  };

  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <fieldset>
          <legend>Notification Preferences</legend>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <label htmlFor="emailNotifications">Email Notifications</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="pushNotifications"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
            />
            <label htmlFor="pushNotifications">Push Notifications</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="smsNotifications"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
            />
            <label htmlFor="smsNotifications">SMS Notifications</label>
          </div>
        </fieldset>
        
        <div className="saved-locations">
          <h3>Saved Locations</h3>
          {profile.savedLocations.length > 0 ? (
            <ul>
              {profile.savedLocations.map(location => (
                <li key={location.id}>
                  <strong>{location.name}</strong>: {location.address}
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved locations</p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="save-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}; 