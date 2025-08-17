import {
  Button,
  ChakraProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { useWalletContext } from '@/providers/WalletProvider';
import Wallet from '@/wallets/Wallet';
import { ThemingProps } from '@chakra-ui/system';

interface WalletButtonProps {
  walletInfo: Wallet;
  afterSelectWallet?: () => void;
}

const WalletButton = ({ walletInfo, afterSelectWallet }: WalletButtonProps) => {
  const { name, id, logo, ready, installed } = walletInfo;
  const { enableWallet } = useWalletContext();

  const connectWallet = () => {
    enableWallet(id);

    afterSelectWallet && afterSelectWallet();
  };

  return (
    <Button
      onClick={connectWallet}
      isLoading={installed && !ready}
      isDisabled={!installed}
      loadingText={name}
      size='lg'
      width='full'
      justifyContent='flex-start'
      alignItems='center'
      gap={4}>
      <img src={logo} alt={`${name}`} width={24} style={{ borderRadius: 3 }} />
      <span>{name}</span>
    </Button>
  );
};

interface WalletSelectionProps {
  buttonLabel?: string;
  buttonProps?: ChakraProps & ThemingProps<'Button'>;
}

export default function WalletSelection({ buttonLabel = 'Connect Wallet', buttonProps }: WalletSelectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { availableWallets } = useWalletContext();

  return (
    <>
      <Button size='md' colorScheme='primary' variant='solid' onClick={onOpen} {...buttonProps}>
        {buttonLabel}
      </Button>
      <Modal onClose={onClose} size='sm' isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Wallet to Connect</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={4}>
            <Stack>
              {availableWallets.map((one) => (
                <WalletButton key={one.id} walletInfo={one} afterSelectWallet={onClose} />
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
