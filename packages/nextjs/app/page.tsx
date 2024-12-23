"use client";

import React, { useEffect, useState } from "react";
import { abi } from "../../hardhat/artifacts/contracts/YourContract.sol/BillPayment.json";
import "./App.css";
import { ethers } from "ethers";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState("");
  const [contract, setContract] = useState("");

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [billId, setBillId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [userBills, setUserBills] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress, abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      setStatusMessage("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to connect wallet.");
    }
  };

  const createBill = async () => {
    if (!contract) return alert("Connect your wallet first!");

    try {
      const tx = await contract.createBill(recipient, ethers.utils.parseEther(amount));
      await tx.wait();
      setStatusMessage(`Bill created successfully. Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error creating bill: ${error.message}`);
    }
  };

  const payBill = async () => {
    if (!contract) return alert("Connect your wallet first!");

    try {
      const tx = await contract.payBill(billId, { value: ethers.utils.parseEther(payAmount) });
      await tx.wait();
      setStatusMessage(`Bill paid successfully. Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error paying bill: ${error.message}`);
    }
  };

  const fetchUserBills = async () => {
    if (!contract) return alert("Connect your wallet first!");

    try {
      const address = await signer.getAddress();
      const bills = await contract.getUserBills(address);
      setUserBills(bills.map(bill => bill.toString()));
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error fetching user bills: ${error.message}`);
    }
  };

  useEffect(() => {
    if (contract && signer) {
      fetchUserBills();
    }
  }, [contract, signer]);

  return (
    <div className="App">
      <h1>Bill Payment Interface</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>{statusMessage}</p>

      <h2>Create Bill</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
      />
      <input type="number" placeholder="Amount (in ETH)" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={createBill}>Create Bill</button>

      <h2>Pay Bill</h2>
      <input type="number" placeholder="Bill ID" value={billId} onChange={e => setBillId(e.target.value)} />
      <input
        type="number"
        placeholder="Amount (in ETH)"
        value={payAmount}
        onChange={e => setPayAmount(e.target.value)}
      />
      <button onClick={payBill}>Pay Bill</button>

      <h2>Your Bills</h2>
      <button onClick={fetchUserBills}>Fetch My Bills</button>
      <ul>
        {userBills.map((id, index) => (
          <li key={index}>Bill ID: {id}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
