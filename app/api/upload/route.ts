import { AccessControlConditions } from "@lit-protocol/types";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { NextRequest, NextResponse } from 'next/server';

const arweaveClient = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientError";
  }
}

const uploadFileToArweave = async (data: ArrayBuffer): Promise<string> => {
  const privateKeyVal = process.env.ARWEAVE_KEY;
  if (!privateKeyVal) {
    throw new Error('Arweave private key is not set in environment variables.');
  }
  const privateKey: JWKInterface = JSON.parse(atob(privateKeyVal));
  const accountAddress = await arweaveClient.wallets.getAddress(privateKey);
  const transaction = await arweaveClient.createTransaction(
    { data },
    privateKey
  );
  const transactionPrice = await arweaveClient.transactions.getPrice(transaction.data.length, accountAddress);
  console.log("Transaction Price:", transactionPrice);

  const balance = await arweaveClient.wallets.getBalance(accountAddress);
  console.log("Account address:", accountAddress);
  console.log("Wallet balance:", balance);

  if (Number(transactionPrice) > Number(balance)) {
    throw new InsufficientBalanceError("Insufficient balance to cover transaction fee.");
  }

  await arweaveClient.transactions.sign(transaction, privateKey);
  const res = await arweaveClient.transactions.post(transaction);
  if (res.status === 200) {
    return transaction.id;
  } else {
    console.error("Transaction response:", res);
    throw new Error("Transaction failed");
  }
}

const encoder = new TextEncoder();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data: {
      ciphertext: string;
      dataToEncryptHash: string;
      condition: AccessControlConditions;
      originalFileName: string;
    } = await request.json();

    if (!("ciphertext" in data) || !("dataToEncryptHash" in data) || !("condition" in data) || !("originalFileName" in data)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Initialize ArweaveClient - credentials might be needed here
    // This is a placeholder, you'll need to configure ArweaveClient appropriately

    const transactionId = await uploadFileToArweave(encoder.encode(JSON.stringify(data)).buffer as ArrayBuffer);

    return NextResponse.json({ success: true, transactionId });
  } catch (error) {
    console.error('Error in API route:', error);
    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({
        error: 'Insufficient balance to cover transaction fee.'
      }, {
        status: 402
      });
    } else if (error instanceof Error) {
      return NextResponse.json({
        error: 'Insufficient balance to cover transaction fee.'
      }, {
        status: 402
      });
    } else {
      return NextResponse.json({
        error: 'Internal Server Error'
      }, {
        status: 500
      });
    }
  }
}

