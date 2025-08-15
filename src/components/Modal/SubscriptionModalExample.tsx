'use client';

import React, { useState } from 'react';
import { Button, Box } from '@chakra-ui/react';
import { SubscriptionModal } from './index';

export const SubscriptionModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmSubscription = (referrerAddress: string) => {
    console.log('认购确认，推荐人地址:', referrerAddress);
    // 这里可以添加认购逻辑
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Button
        onClick={handleOpenModal}
        bg="#21C161"
        color="white"
        _hover={{ bg: '#1AAD56' }}
        size="lg"
      >
        打开认购弹窗
      </Button>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubscription}
      />
    </Box>
  );
};

export default SubscriptionModalExample; 