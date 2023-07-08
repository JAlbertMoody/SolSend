import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Buffer } from  "buffer"

export const SendSolForm = () => {
    window.Buffer = Buffer;
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!publicKey || !connection) return;

            const accountInfo = await connection.getAccountInfo(publicKey);
            if (accountInfo) {
                const lamports = accountInfo.lamports;
                const solBalance = lamports / LAMPORTS_PER_SOL;
                setBalance(solBalance);
        }
    };

    fetchBalance();
  }, [publicKey, connection, txSig]);


    const link = () => {
        return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : '';
    };

    const sendSol = event => {
        event.preventDefault();
        if (!connection || !publicKey) { return; }
        const transaction = new Transaction();
        const recipientPubKey = new PublicKey(event.target.recipient.value);

        const sendSolInstruction = SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubKey,
            lamports: LAMPORTS_PER_SOL * event.target.amount.value
        });

        transaction.add(sendSolInstruction);
        sendTransaction(transaction, connection).then(sig => {
            setTxSig(sig);
        });
    };


    return (
        <div>
          {publicKey ? (
            <>
              <p>Your SOL balance: {balance} SOL</p>
              <form onSubmit={sendSol}>
                <label htmlFor="amount">Amount (in SOL) to send:</label>
                <input id="amount" type="text" placeholder="e.g. 0.1" required />
                <br />
                <label htmlFor="recipient">Send SOL to:</label>
                <input
                  id="recipient"
                  type="text"
                  placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA"
                  required
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <span>Connect Your Wallet</span>
          )}
          {txSig ? (
            <div>
              <p>View your transaction on</p>
              <a href={link()}>Solana Explorer</a>
            </div>
          ) : null}
        </div>
      );
};
