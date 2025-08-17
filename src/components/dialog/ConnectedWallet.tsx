import { useWalletContext } from "@/providers/WalletProvider.tsx";
import { Flex, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import React from "react";
import WebsiteWallet from "@/wallets/WebsiteWallet.ts";

export default function ConnectedWallet() {
  const { connectedWallet } = useWalletContext();
  const walletUrl = connectedWallet instanceof WebsiteWallet ? connectedWallet.walletUrl : undefined;

  return (
    <LinkBox>
      <Flex align='center' gap={3} flex={1}>
        <LinkOverlay href={walletUrl} isExternal>
          <img src={connectedWallet?.logo} alt={connectedWallet?.name} width={32} style={{ borderRadius: 3 }}/>
        </LinkOverlay>
        <Flex direction='column'>
          <Text fontWeight='600'>{connectedWallet?.name}</Text>
          <Text fontSize='14'>
            {connectedWallet?.id} - v{connectedWallet?.version}
          </Text>
        </Flex>
      </Flex>
    </LinkBox>
  )
}
