import React, { useState } from 'react';
import { Modal, Textarea, Button } from '@mantine/core';

interface CustomModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (input: string) => void;
  title: string; // Customizable title
  placeholder: string; // Customizable placeholder for Textarea
  buttonText: string; // Customizable button text
  isMobile: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({ 
  opened, 
  onClose, 
  onSubmit, 
  title, 
  placeholder, 
  buttonText, 
  isMobile,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    onSubmit(input);
    setInput(''); // Clear input after submit
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title} // Use the customizable title
      centered
      fullScreen={isMobile}
    >
      <Textarea
        placeholder={placeholder} // Use the customizable placeholder
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button onClick={handleSubmit} mt="md">{buttonText}</Button> {/* Use the customizable button text */}
    </Modal>
  );
};
