import { AccessControlConditions } from "@lit-protocol/types";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { NextRequest, NextResponse } from 'next/server';

const arweaveClient = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const uploadFileToArweave = async (data: ArrayBuffer): Promise<string> => {
  try {
    const privateKeyVal = process.env.ARWEAVE_KEY;
    if (!privateKeyVal) {
      throw new Error('Arweave private key is not set in environment variables.');
    }
    const privateKey: JWKInterface = JSON.parse(atob(privateKeyVal));
    const transaction = await arweaveClient.createTransaction(
      { data },
      privateKey
    );
    await arweaveClient.transactions.sign(transaction, privateKey);
    const res = await arweaveClient.transactions.post(transaction);
    if (res.status === 200) {
      return transaction.id;
    } else {
      console.error("Transaction failed:", res.statusText);
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error('Error uploading file to Arweave:', error);
    throw error;
  }
}

const encoder = new TextEncoder();

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

