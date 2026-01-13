import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getProfile();
      return response.data;
    },
    enabled: isAuthenticated(),
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await updateProfile(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
    },
  });

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (profileData?.user) {
      setFormData({ name: profileData.user.name || '' });
    }
  }, [profileData]);

  if (!isAuthenticated()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const profileUser = profileData?.user || user;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Profile</h1>
        <div className="profile-content">
          {!isEditing ? (
            <>
              <div className="profile-info">
                <div className="profile-field">
                  <label>Name</label>
                  <p>{profileUser?.name || 'Not specified'}</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>{profileUser?.email || 'Not specified'}</p>
                </div>
              </div>
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="profile-actions">
                <button type="submit" className="save-button" disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: profileUser?.name || '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

