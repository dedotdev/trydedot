import { Box, Divider, Link, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import Settings from '@/components/dialog/Settings.tsx';
import WalletSelection from '@/components/dialog/WalletSelection';

export default function WelcomeBoard() {
  return (
    <Box>
      <Box textAlign='center'>
        <Box w={28} mx='auto' mt={8} mb={4}>
          <img src='/dedot-dark-logo.png' />
        </Box>
        <Text as='h1' bgGradient='linear(to-l, #7928CA, #FF0080)' bgClip='text' fontSize='3xl' fontWeight='bold' mb={4}>
          Welcome to{' '}
          <Text as='span' whiteSpace='nowrap'>
            Dedot Demo Dapp
          </Text>
        </Text>
        <Text mb={4} fontSize='xl'>
          Connect to your wallet to getting started
        </Text>
        <WalletSelection />
      </Box>
      <Divider mt={8} mb={4} />
      <Box mb={4}>
        <Text fontWeight='bold' mb={2}>
          Notes
        </Text>
        <UnorderedList>
          <ListItem>
            You can change the settings (<Settings size='xs' />) for more options when connecting to networks.
          </ListItem>
          <ListItem>
            Due to network conditions, it might take longer than expected to connect to networks via light client.
            Please be patient.
          </ListItem>
          <ListItem>
            It's recommended to use the{' '}
            <Link
              href='https://paritytech.github.io/json-rpc-interface-spec/introduction.html'
              isExternal
              color='primary.500'>
              new JSON-RPC APIs
            </Link>{' '}
            when connecting via light client for better performance.
          </ListItem>
          <ListItem>
            You can connect and interact with networks on <b>mobile phone browsers</b> with the support of{' '}
            <Link href='https://github.com/dedotdev/dedot-web-signer' isExternal color='primary.500'>
              Dedot Signer
            </Link>
            . Make sure to open the dapp on a native browser app (Chrome, Safari or Firefox), in-app browser might not work as
            expected.
          </ListItem>
          <ListItem>
            When connecting via light client, you might want to{' '}
            <Link href='https://superuser.com/a/1672733' isExternal color='primary.500'>
              allow insecure content
            </Link>{' '}
            on your browser for better connectivity to the network. E.g: some nodes are using insecure connection
            (via ws://).
          </ListItem>
          <ListItem>
            <b>DISCLAIMER</b>: This is a demo dapp, please <b>do not</b> connect to or interact with wallets holding your real assets.
          </ListItem>
        </UnorderedList>
      </Box>
    </Box>
  );
}
