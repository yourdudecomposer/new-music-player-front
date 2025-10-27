import React, { useState } from 'react';
import styled from 'styled-components';
import { uploadTrack } from '../api';
import { theme } from '../styles/theme';

const UploadContainer = styled.div`
  margin-bottom: ${theme.spacing.large};
  padding: ${theme.spacing.medium};
  background-color: ${theme.colors.surface};
  border-radius: 8px;
`;

const UploadButton = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 5px;
  background-color: #444;
  border-radius: 5px;
  margin-top: 10px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background-color: ${theme.colors.primary};
    transition: width 0.2s ease-in-out;
  }
`;

interface UploadFormProps {
  onUploadComplete: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('track', file);

    try {
      await uploadTrack(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      onUploadComplete();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Сброс инпута
      }
    }
  };

  return (
    <UploadContainer>
      <h3>Upload New Track</h3>
      <HiddenInput
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".mp3"
        disabled={isUploading}
      />
      <UploadButton onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
        {isUploading ? `Uploading...` : 'Choose MP3 File'}
      </UploadButton>
      {isUploading && <ProgressBar progress={uploadProgress} />}
    </UploadContainer>
  );
};

export default UploadForm;
