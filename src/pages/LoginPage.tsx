import React from 'react';
import styled from 'styled-components';
import { login } from '../api';
import { theme } from '../styles/theme';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.medium};
  padding: ${theme.spacing.large};
  background-color: ${theme.colors.surface};
  border-radius: 8px;
  width: 100%;
  max-width: 320px;
  margin: 0 ${theme.spacing.medium};
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${theme.colors.textSecondary};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 12px;
  border-radius: 4px;
  border: none;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    opacity: 0.9;
  }
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 0.9em;
  text-align: center;
`;

const PasswordWrapper = styled.div`
  position: relative;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${theme.colors.textSecondary};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 1rem;
`;

const PasswordInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  color: ${theme.colors.text};
  font-size: 1rem;
  width: 100%;
  padding-right: 35px;
  
  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 4px;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.7;
  }
`;

const LoginPage: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/'; // Перезагружаем страницу для перехода на плеер
    } catch (err) {
      setError('Invalid username or password');
      console.error(err);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <Input
          type="text"
          placeholder="Username (user1 or user2)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <PasswordWrapper>
          <PasswordInput
            type={showPassword ? "text" : "password"}
            placeholder="Password (password123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <EyeButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </EyeButton>
        </PasswordWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Log In</Button>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;
