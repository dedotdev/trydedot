import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { InjectedAccount } from '@/types';
import { useApiContext } from '@/providers/ApiProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { shortenAddress } from '@/utils/string';
import { EditIcon } from '@chakra-ui/icons';

interface SignRawMessageButtonProps {
  fromAccount: InjectedAccount;
}

export default function SignRawMessageButton({ fromAccount }: SignRawMessageButtonProps) {
  const { ready, client } = useApiContext();
  const { injectedApi } = useWalletContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messageToSign, setMessageToSign] = useState<string>('This is a dummy message!');

  const signMessage = async () => {
    if (!client || !injectedApi) {
      return;
    }

    try {
      // @ts-ignore
      const result = await injectedApi!.signer.signRaw({
        address: fromAccount.address,
        type: 'bytes',
        data: messageToSign,
      });

      toast.success( <p>Signing completed, signature: <b>{result.signature}</b></p>);
    } catch (e: any) {
      toast.error(e.toString());
    }
  };

  return (
    <>
      <Button isLoading={!ready} onClick={onOpen} leftIcon={<EditIcon />}>
        Sign Message
      </Button>
      <Modal onClose={onClose} size='lg' isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Raw Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor='fromAddressInput'>From Account</FormLabel>
              <InputGroup size='lg'>
                <Input
                  id='fromAddressInput'
                  type='text'
                  placeholder='From Address'
                  value={`${fromAccount.name} (${shortenAddress(fromAccount.address)})`}
                  readOnly
                />
              </InputGroup>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='toSignMessageInput'>Message To Sign</FormLabel>
              <Textarea
                id='toSignMessageInput'
                placeholder='Message To Sign'
                autoFocus
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={4}>
            <Button onClick={onClose}>Cancel</Button>
            <Button colorScheme='primary' onClick={signMessage}>
              Sign Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
