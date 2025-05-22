import {
  aggregatorAddress,
  aggregatorV3ABI,
  JSON_RPC_ENDPOINT,
} from "@/constant";
import { useToast } from "@/contexts/ToastContext";
import {
  CHRLE_PARTY_CONTRACT_ABI,
  CHRLE_PARTY_CONTRACT_ADDRESS,
  CHRLE_PRESALE_ABI,
  CHRLE_PRESALE_ADDRESS,
} from "@/contract";
import { TransactionResponse } from "@/types/api";
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitState,
} from "@reown/appkit-ethers-react-native";
import { Address } from "@stripe/stripe-react-native";
import {
  AddressLike,
  BrowserProvider,
  ethers,
  formatEther,
  JsonRpcApiProvider,
  JsonRpcSigner,
  Signer,
} from "ethers";
import { useState } from "react";

const useWeb3 = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const { walletProvider } = useAppKitProvider();
  const { selectedNetworkId } = useAppKitState();

  const { address: walletAddress } = useAppKitAccount();

  const { showToast } = useToast();

  const getBalance = async (address: AddressLike, selectedChainId: number) => {
    if (!walletProvider) {
      throw new Error("Wallet provider is not available");
    }
    const provider = new BrowserProvider(walletProvider, selectedChainId);
    const balance = await provider.getBalance(address);
    const eth = formatEther(balance);
    return Number(eth);
  };

  const getSigner = (
    provider: JsonRpcApiProvider,
    address: Address
  ): Signer => {
    return new JsonRpcSigner(provider, address as unknown as string);
  };

  const getProvider = () => {
    if (!walletProvider) {
      throw new Error("Wallet provider is not available");
    }
    return new BrowserProvider(walletProvider, selectedNetworkId);
  };

  const getDistributorContract = () => {
    const provider = getProvider();
    const signer = getSigner(provider, walletAddress as Address);
    const contract = new ethers.Contract(
      CHRLE_PARTY_CONTRACT_ADDRESS,
      CHRLE_PARTY_CONTRACT_ABI,
      signer
    );
    return contract;
  };

  const getPresaleContract = () => {
    const provider = getProvider();
    const signer = getSigner(provider, walletAddress as Address);
    const contract = new ethers.Contract(
      CHRLE_PRESALE_ADDRESS,
      CHRLE_PRESALE_ABI,
      signer
    );
    return contract;
  };

  const depositSticker = async (
    value: string,
    address: string
  ): Promise<TransactionResponse | null> => {
    try {
      const partyContract = getDistributorContract();
      if (!partyContract) return null;

      setLoading(true);

      const amountInWei = ethers.parseUnits(value, 18);

      const tx = await partyContract.depositSticker({ value: amountInWei });

      const receipt = await tx.wait();

      return {
        type: "buy",
        status: "completed",
        hash: receipt.hash,
        address,
        success: true,
        createdAt: new Date(),
        totalAmount: "0",
      };
    } catch (error) {
      console.error("deposit sticker error: ", error);
      showToast("Transaction failed", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const depositSubscription = async (
    value: string
  ): Promise<TransactionResponse | null> => {
    try {
      const partyContract = getDistributorContract();
      const presaleContract = getPresaleContract();
      if (!partyContract) return null;

      setLoading(true);

      const amountInWei = ethers.parseUnits(value, 18);

      const tx = await partyContract.depositSubscription({
        value: amountInWei,
      });

      const receipt = await tx.wait();

      const eventLog = receipt.logs.find(
        (log: any) => log?.args && log.args.length === 4
      );

      const [sender, totalAmount, presaleAmount] = eventLog.args;

      const totalTokenAmount = await presaleContract.presaleAllocations(
        CHRLE_PARTY_CONTRACT_ADDRESS
      );

      return {
        address: sender,
        createdAt: new Date(),
        status: "completed",
        type: "subscription",
        success: true,
        totalAmount: ethers.formatEther(totalAmount),
        botAmount: ethers.formatEther(presaleAmount),
        hash: receipt.hash,
        boughtTokens: totalTokenAmount.toString(),
      };
    } catch (error) {
      console.error("deposit subscription error: ", error);
      setLoading(false);
      return null;
    }
  };

  // Fetches the current BNB price in USD
  const fetchBnbPrice = async () => {
    const provider = new ethers.JsonRpcProvider(JSON_RPC_ENDPOINT);
    const priceFeed = new ethers.Contract(
      aggregatorAddress,
      aggregatorV3ABI,
      provider
    );

    const roundData = await priceFeed.latestRoundData();
    const price = Number(roundData.answer) / 1e8;
    return Number(price);
  };

  // Fetches the balance of a special address
  const getBalanceForSpecialAddress = async (address: AddressLike) => {
    try {
      const provider = new ethers.JsonRpcProvider(JSON_RPC_ENDPOINT);

      const balance = await provider.getBalance(address);

      const bnb = formatEther(balance);

      return Number(bnb);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      return null;
    }
  };

  return {
    fetchBnbPrice,
    getBalanceForSpecialAddress,
    getBalance,
    depositSticker,
    depositSubscription,
    loading,
  };
};

export default useWeb3;
