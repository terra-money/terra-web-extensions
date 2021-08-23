import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

interface AddressMap {
  bLunaHub: string;
  bLunaToken: string;
  bLunaReward: string;
  bLunaAirdrop: string;
  mmInterestModel: string;
  mmOracle: string;
  mmMarket: string;
  mmOverseer: string;
  mmCustody: string;
  mmLiquidation: string;
  mmDistributionModel: string;
  aTerra: string;
  terraswapblunaLunaPair: string;
  terraswapblunaLunaLPToken: string;
  terraswapAncUstPair: string;
  terraswapAncUstLPToken: string;
  gov: string;
  distributor: string;
  collector: string;
  community: string;
  staking: string;
  ANC: string;
  airdrop: string;
  team_vesting: string;
  investor_vesting: string;
}

export interface ContractProviderProps {
  children: ReactNode;
  address: AddressMap;
}

export interface ContractState {
  address: AddressMap;
}

// @ts-ignore
const ContractContext: Context<ContractState> = createContext<ContractState>();

export function ContractProvider({ children, address }: ContractProviderProps) {
  const state = useMemo<ContractState>(() => {
    return { address };
  }, [address]);

  return (
    <ContractContext.Provider value={state}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract(): ContractState {
  return useContext(ContractContext);
}

export function useContractAddress(): AddressMap {
  const { address } = useContext(ContractContext);
  return address;
}

export const ContractConsumer: Consumer<ContractState> =
  ContractContext.Consumer;
