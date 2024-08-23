"use client";
import { Web3 } from "web3";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import base64url from "base64url";

const Form = () => {
    const [actualAddress, setActualAddress] = useState("");
    const searchParams = useSearchParams();
    const encodedTmpSecretKey = searchParams.get("k") || "";
    const web3 = new Web3("https://public-en-baobab.klaytn.net"); //https://docs.klaytn.foundation/docs/build/tutorials/connecting-metamask/#connect-to-klaytn-baobab-network-testnet-
    const router = useRouter()
 

    const transferToActualAddress = async () => {
      try {
        if (encodedTmpSecretKey == "") {
            throw Error("Can't get temp key")
        }
        const tmpPrivateKey = base64url.decode(encodedTmpSecretKey)
        const tmpAccount = web3.eth.accounts.wallet.add(tmpPrivateKey)[0];
        const tmpAccountBalance = await web3.eth.getBalance(tmpAccount.address)

        // calculate gas cost & max remittance value
        const gasPrice = await web3.eth.getGasPrice()
        const gasLimit = BigInt(21000) // https://docs.klaytn.foundation/docs/learn/transaction-fees/intrinsic-gas/#txtypedgas-
        const gasCost = gasPrice * gasLimit
        const maxRemittanceValue = tmpAccountBalance - gasCost
        
        await web3.eth.sendTransaction({
            from: tmpAccount.address,
            to: actualAddress,
            value: maxRemittanceValue,
            gas: gasLimit,
            gasPrice: gasPrice
        });
        router.push("/result")
      } catch (e) {
        console.error(e);
      }
    };
    const handleChange = (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        setActualAddress(e.target.value)
    }

    return (
      <>
        <form>
            <input type="text" className="text-black" name="address" value={actualAddress} onChange={handleChange} />
        </form>
        <button
          type="button"
          className="bg-indigo-600 text-white text-bg leading-6 font-medium py-2 px-3 rounded-lg"
          onClick={transferToActualAddress}
        >
          Get token
        </button>
      </>
    );
  };

export default function Receive() {
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div></div>
        <div></div>
        <h1 className="text-2xl font-bold">Input your address</h1>
        <Suspense>
            <Form />
        </Suspense>
        <div></div>
        <div></div>
      </main>
    );
  }