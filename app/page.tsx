"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const RPC_URL = "https://tea-sepolia.g.alchemy.com/public";
const CHAIN_ID = 10218;

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("0.001");
  const [recipient, setRecipient] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      console.log("✅ MetaMask detected!");
    } else {
      console.warn("⚠️ MetaMask not found!");
    }
  }, []);

  async function connectWallet() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("⚠️ MetaMask not detected. Please install MetaMask.");
      return;
    }

    try {
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const newProvider = new ethers.BrowserProvider((window as any).ethereum, "any");
      const network = await newProvider.getNetwork();

      if (network.chainId !== BigInt(CHAIN_ID)) {
        alert(`⚠️ Please switch to Tea Testnet (Chain ID: ${CHAIN_ID})`);
        return;
      }

      const newSigner = await newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(await newSigner.getAddress());
      console.log("✅ Connected:", newSigner);
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
    }
  }

  async function sendToken() {
    if (!recipient || !amount) return alert("⚠️ Please enter recipient address and amount.");
    if (!account || !signer) return alert("⚠️ Please connect wallet first.");

    setLoading(true);
    setTransactionHash(null);
    setErrorMsg(null);

    try {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseUnits(amount, "ether"),
      });

      await tx.wait();
      setTransactionHash(tx.hash);
      setRecipient(""); // Xóa ô địa chỉ ví sau khi gửi thành công
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);
      setErrorMsg(error.message || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center flex-grow space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 mb-6">
          {account ? (
            <>
              <h2 className="text-lg font-bold mb-4">Send TEA</h2>
              <label className="block mb-2">Amount (TEA)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded-md mb-3"
              />
              <label className="block mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2 border rounded-md mb-3"
                disabled={loading}
              />
              <button
                onClick={sendToken}
                className={`w-full p-2 rounded-md text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send TEA"}
              </button>

              {/* Hiển thị giao dịch thành công */}
              {transactionHash && (
                <div className="mt-4 p-3 text-green-700 bg-green-100 border border-green-400 rounded-md">
                  ✅ Transaction Successful!  
                  <br />
                  <a
                    href={`https://sepolia.tea.xyz/tx/${transactionHash}`}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    View Transaction
                  </a>
                </div>
              )}

              {/* Hiển thị lỗi giao dịch */}
              {errorMsg && (
                <div className="mt-4 p-3 text-red-700 bg-red-100 border border-red-400 rounded-md">
                  ❌ Transaction Failed  
                  <br />
                  {errorMsg}
                </div>
              )}
            </>
          ) : (
            <button onClick={connectWallet} className="w-full p-3 bg-green-500 text-white rounded-md">
              Connect Wallet
            </button>
          )}
        </div>

      {/* Footer copyright */}
      <footer className="w-full p-4 bg-gray-800 text-white text-center">
        <p>&copy; 2025 TanLe. All rights reserved.</p>
      </footer>
    </div>
  );
}
