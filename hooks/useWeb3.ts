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
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
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

  const { showToast } = useToast();

  const { provider: walletProvider, address: walletAddress } =
    useWalletConnectModal();

  const getBalance = async (address: AddressLike, selectedChainId: number) => {
    if (!walletProvider) {
      throw new Error("Wallet provider is not available");
    }
    const provider = new BrowserProvider(walletProvider, selectedChainId);
    const balance = await provider.getBalance(address);
    const eth = formatEther(balance);
    return Number(eth);
  };

  const getSigner = (provider: JsonRpcApiProvider, address: string): Signer => {
    return new JsonRpcSigner(provider, address as unknown as string);
  };

  const getProvider = async () => {
    if (!walletProvider) throw new Error("Wallet provider is not available");
    const chainId = await walletProvider.request({
      method: "eth_chainId",
    });

    if (!walletProvider) {
      throw new Error("Wallet provider is not available");
    }

    if (!chainId) {
      throw new Error("Wallet provider is not available");
    }

    return new BrowserProvider(walletProvider, chainId);
  };

  const getDistributorContract = async () => {
    const provider = await getProvider();
    const signer = getSigner(provider, walletAddress as unknown as string);
    const contract = new ethers.Contract(
      CHRLE_PARTY_CONTRACT_ADDRESS,
      CHRLE_PARTY_CONTRACT_ABI,
      signer
    );
    return contract;
  };

  const getPresaleContract = async () => {
    const provider = await getProvider();
    const signer = getSigner(provider, walletAddress as unknown as string);
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
      const partyContract = await getDistributorContract();
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
      const partyContract = await getDistributorContract();
      const presaleContract = await getPresaleContract();
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

  const ensureBSCChain = async (provider: any) => {
    try {
      const currentChainId = await provider.request({
        method: "eth_chainId",
      });
      if (Number(currentChainId) !== 56) {
        // 0x38 is 56 in hex
        // Try to switch to BSC
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      }
    } catch (err: any) {
      // If BSC is not added, prompt to add it
      if (err.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x38",
              chainName: "Binance Smart Chain",
              rpcUrls: ["https://bsc-dataseed1.binance.org/"],
              nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
              blockExplorerUrls: ["https://bscscan.com"],
            },
          ],
        });
      } else {
        // Handle other errors (optional)
        console.error("Chain switch error:", err);
      }
    }
  };

  return {
    fetchBnbPrice,
    getBalanceForSpecialAddress,
    getBalance,
    depositSticker,
    depositSubscription,
    ensureBSCChain,
    loading,
  };
};

export default useWeb3;
