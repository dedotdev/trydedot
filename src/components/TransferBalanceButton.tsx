import { Button, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useBoolean } from 'react-use';
import { useApiContext } from '@/providers/ApiProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { InjectedAccount, JsonRpcApi } from '@/types';
import { shortenAddress } from '@/utils/string';
import WebsiteWallet from "@/wallets/WebsiteWallet.ts";
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { SubstrateApi } from "@dedot/chaintypes";
import { decodeAddress } from '@dedot/utils';
import { ISubstrateClient } from "dedot";
import { RpcVersion } from 'dedot/types';


interface TransferBalanceButtonProps {
  fromAccount: InjectedAccount;
}

const checkAddress = (addressToCheck: string) => {
  try {
    return !!decodeAddress(addressToCheck);
  } catch (e) {
    return false;
  }
};

export default function TransferBalanceButton({ fromAccount }: TransferBalanceButtonProps) {
  const { apiReady, api, legacy, jsonRpc, network } = useApiContext();
  const { injectedApi, connectedWallet } = useWalletContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [destValidation, setDestValidation] = useState<string>('');

  const [amountToSend, setAmountToSend] = useState<string>('1');
  const [amountValidation, setAmountValidation] = useState<string>('');

  const [loading, setLoading] = useBoolean(false);

  useEffect(() => {
    if (isOpen) {
      setDestinationAddress('');
      setLoading(false);
      setAmountToSend('1');
    }
  }, [isOpen]);

  useEffect(() => {
    if (destinationAddress && destinationAddress.length !== 48 && !checkAddress(destinationAddress)) {
      setDestValidation('Invalid destination address');
    } else {
      setDestValidation('');
    }
  }, [destinationAddress]);

  useEffect(() => {
    const numberToSend = parseFloat(amountToSend);
    if (!Number.isFinite(numberToSend) || numberToSend <= 0) {
      setAmountValidation('Amount should be a positive number');
    } else {
      setAmountValidation('');
    }
  }, [amountToSend]);

  const makeTransfer = async () => {
    if (!!destValidation) {
      return;
    }

    const client: ISubstrateClient<SubstrateApi[RpcVersion]> | undefined = jsonRpc === JsonRpcApi.NEW ? api : legacy;

    if (!client || !injectedApi) {
      return;
    }

    setLoading(true);
    const toastId = toast.info(<p>Signing...</p>, { autoClose: false, isLoading: true });

    try {
      if (connectedWallet instanceof WebsiteWallet) {
        await connectedWallet.sdk?.newWaitingWalletInstance();
      }

      const unsub = await client.tx.balances
        .transferKeepAlive(destinationAddress, BigInt(`${parseFloat(amountToSend) * Math.pow(10, network.decimals)}`))
        .signAndSend(fromAccount.address, async ({ status }) => {
          console.log(status);

          if (status.type === 'BestChainBlockIncluded' || status.type === 'Finalized') {
            toast.update(toastId, {
              render: <p>Tx status: <b>{status.type}</b></p>,
              type: 'success',
              isLoading: status.type !== 'Finalized'
            });

            if (status.type === 'BestChainBlockIncluded') {
              setLoading(false);
              onClose();
            } else {
              setTimeout(() => {
                toast.dismiss(toastId);
              }, 2000);

              await unsub();
            }
          } else if (status.type === 'Invalid') {
            toast.update(toastId, {
              render: <p>Tx status: <b>{status.type}</b></p>,
              type: 'error',
            });

            setLoading(false);
            onClose();

            setTimeout(() => {
              toast.dismiss(toastId);
            }, 2000);

            await unsub();
          } else {
            toast.update(toastId, {
              render: <p>Tx status: <b>{status.type}</b></p>,
              type: 'info',
              isLoading: true
            });
          }
        });
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error(e.toString());
      setLoading(false);
    }
  };

  return (
    <>
      <Button isLoading={!apiReady} onClick={onOpen} leftIcon={<ExternalLinkIcon />}>
        Transfer
      </Button>
      <Modal onClose={onClose} size='lg' isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer Balance</ModalHeader>
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

            <FormControl mt={4} isInvalid={!!destValidation}>
              <FormLabel htmlFor='toAddressInput'>Destination Address</FormLabel>
              <InputGroup size='lg'>
                <Input
                  id='toAddressInput'
                  type='text'
                  placeholder='To Address'
                  autoFocus
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
              </InputGroup>
              <FormErrorMessage>{destValidation}</FormErrorMessage>
            </FormControl>

            <FormControl mt={4} isInvalid={!!amountValidation}>
              <FormLabel htmlFor='amountToTransferInput'>Amount To Transfer</FormLabel>
              <InputGroup size='lg'>
                <Input
                  id='amountToTransferInput'
                  type='number'
                  step='0.01'
                  placeholder='Amount To Transfer'
                  value={amountToSend}
                  onChange={(e) => setAmountToSend(e.target.value)}
                />
                <InputRightAddon>{network.symbol}</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>{amountValidation}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={4}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              colorScheme='primary'
              isDisabled={!!destValidation || !!amountValidation || !destinationAddress}
              isLoading={loading}
              onClick={makeTransfer}>
              Make Transfer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
