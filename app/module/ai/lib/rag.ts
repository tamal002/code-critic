import { pineconeIndex } from "@/lib/pinecone";
import {embed} from "ai";
import {google} from "@ai-sdk/google";


// Generate embeddings for the given text using Google PaLM API
export const generateEmbeddings = async (text: string) => {
    // Generate embeddings using Google PaLM API
    const {embedding} = await embed({
        model: google.embedding('gemini-embedding-001'),
        value: text,
    });

    return embedding;
}


// Index codebase files into Pinecone vector database
export const indexCodebase = async (repoId: string, files: {path: string, content: string}[]) => {

    const vectors = []; // Array to hold vectors to be indexed

    // Process each file in the codebase
    for(const file of files) {
        const content = `File Path: ${file.path}\n\n${file.content}`;
        const truncatedContent = content.slice(0, 8000); // Pinecone max limit is 8192 bytes
        
        try {
            const embedding = await generateEmbeddings(truncatedContent);
            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, '-')}`, // Unique ID for each vector
                values: embedding,
                metadata: {
                    repoId,
                    path: file.path,
                    content: truncatedContent
                }
            })
        } catch (error) {
            console.error(`Error generating embedding for file ${file.path}:`, error);
        }
        
        // Batch upsert to Pinecone to avoid large payloads
        if(vectors.length > 0){
            const batchSize = 100;
            for(let i = 0; i < vectors.length; i += batchSize){
                const batch = vectors.slice(i, i + batchSize);
                await pineconeIndex.upsert(batch);
            }
        }
        console.log(`Indexed ${vectors.length} files for repo ${repoId}`);
    }
}


// Retrieve relevant context from Pinecone based on the query
export async function retrieveContext(query: string, repoId: string, topK: number = 5){

    // Generate embeddings for the query
    const queryEmbedding = await generateEmbeddings(query);

    // Query Pinecone for similar vectors
    const queryResponse = await pineconeIndex.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: {
            repoId: repoId
        }
    });

    // Extract and return the metadata of the matched vectors
    return queryResponse.matches?.map(match => match.metadata) || [];
}
