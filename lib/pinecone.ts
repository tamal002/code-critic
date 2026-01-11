
import {Pinecone} from "@pinecone-database/pinecone";


// Initialize Pinecone client
export const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_DB_API_KEY!,
});


// Access a specific Pinecone index
export const pineconeIndex = pineconeClient.Index("code-critic-vector-embedding-v1");