import React, { useState, useRef } from 'react';
import { User } from '../types.js';
import { api } from '../utils/api.js';

export const ProfileModal = ({ user, updateUser, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        setIsLoading(true);
        setError(null);
        try {
            const updatedUser = await api.uploadProfilePicture(formData);
            updateUser(updatedUser);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to upload image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" onClick={onClose}>
            <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Your Profile</h2>

                <div className="flex flex-col items-center space-y-4">
                    <img
                        src={preview || user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random&size=128`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                    />
                    <div className="text-center">
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full text-center py-2 px-4 border border-gray-300 dark:border-dark-border rounded-md text-sm font-medium hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                    >
                        Change Picture
                    </button>
                    
                    {error && <p className="text-sm text-red-500">{error}</p>}

                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isLoading}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
