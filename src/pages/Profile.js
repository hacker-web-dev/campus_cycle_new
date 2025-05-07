import React, { useState } from 'react';
import { FaUser, FaEdit, FaSave, FaUniversity, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const Profile = () => {
  // Mock user data
  const initialUserData = {
    name: 'Alex Johnson',
    email: 'alex@university.edu',
    phone: '(555) 123-4567',
    university: 'University of California, Berkeley',
    joinDate: 'August 2022',
    bio: 'Computer Science student passionate about technology and sustainability. Looking to buy and sell items within the campus community.',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [tempUserData, setTempUserData] = useState(initialUserData);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setUserData(tempUserData);
    } else {
      // Start editing
      setTempUserData(userData);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserData({
      ...tempUserData,
      [name]: value
    });
  };

  const handleCancel = () => {
    setTempUserData(userData);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Header Section */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account settings</p>
            </div>
            <button
              onClick={handleEditToggle}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              {isEditing ? (
                <>
                  <FaSave className="-ml-1 mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <FaEdit className="-ml-1 mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Content Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row">
              {/* Profile Image */}
              <div className="flex flex-col items-center md:w-1/3 mb-6 md:mb-0">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src={userData.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md border border-gray-200 hover:bg-gray-50"
                    >
                      <FaEdit className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-medium text-gray-900">{userData.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                    <FaCalendarAlt className="mr-1 h-3 w-3" />
                    Member since {userData.joinDate}
                  </p>
                </div>
              </div>

              {/* Profile Information */}
              <div className="md:w-2/3 md:pl-8">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaUser className="mr-2 h-4 w-4 text-gray-400" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={tempUserData.name}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{userData.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaEnvelope className="mr-2 h-4 w-4 text-gray-400" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={tempUserData.email}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{userData.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaPhone className="mr-2 h-4 w-4 text-gray-400" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={tempUserData.phone}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{userData.phone}</p>
                    )}
                  </div>

                  {/* University Field */}
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaUniversity className="mr-2 h-4 w-4 text-gray-400" />
                      University
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="university"
                        id="university"
                        value={tempUserData.university}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{userData.university}</p>
                    )}
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        id="bio"
                        rows={3}
                        value={tempUserData.bio}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{userData.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Action Buttons */}
          {isEditing && (
            <div className="px-4 py-4 sm:px-6 bg-gray-50 text-right">
              <button
                type="button"
                onClick={handleCancel}
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Account Settings Section */}
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Account Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account preferences</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_notifications"
                    name="email_notifications"
                    type="checkbox"
                    defaultChecked={true}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_notifications" className="font-medium text-gray-700">Email notifications</label>
                  <p className="text-gray-500">Receive email notifications when someone messages you or saves your listing.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="profile_visibility"
                    name="profile_visibility"
                    type="checkbox"
                    defaultChecked={true}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="profile_visibility" className="font-medium text-gray-700">Profile visibility</label>
                  <p className="text-gray-500">Allow other users to see your profile information.</p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="mt-4 text-sm text-red-600 hover:text-red-500"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;