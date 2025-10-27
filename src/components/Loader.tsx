import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.large};
`;

const Spinner = styled.div`
  border: 4px solid ${theme.colors.surface};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: ${spin} 1s linear infinite;
`;

const Loader: React.FC = () => {
  return (
    <LoaderContainer>
      <Spinner />
    </LoaderContainer>
  );
};

export default Loader;

