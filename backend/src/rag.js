import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { TextLoader } from "langchain/document_loaders/fs/text";
import * as fs from "fs/promises";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

let vectorStore = null;
const VECTOR_STORE_PATH = "./vector_store";

export async function initRAG() {
    // Check if vector store already exists
    try {
        await fs.access(VECTOR_STORE_PATH);
        console.log("Loading existing vector store...");

        const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HUGGINGFACEHUB_API_KEY,
            model: "sentence-transformers/all-MiniLM-L6-v2",
        });

        vectorStore = await FaissStore.load(VECTOR_STORE_PATH, embeddings);
        console.log("Vector store loaded successfully!");
        return;
    } catch (error) {
        console.log("Vector store not found, creating new one...");
    }

    // Create new vector store if it doesn't exist
    const loader = new TextLoader("./src/gita_data.txt");
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 50,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACEHUB_API_KEY,
        model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    console.log("Creating embeddings...");
    vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);

    // Save the vector store to local storage
    console.log("Saving vector store...");
    await vectorStore.save(VECTOR_STORE_PATH);
    console.log("Vector store saved successfully!");
}

export async function getAnswerFromGita(userQuestion) {
    try {
        if (!vectorStore) throw new Error("Vector store not initialized");

        const relevantDocs = await vectorStore.similaritySearch(userQuestion, 3);
        const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

        // const llm = new HuggingFaceInference({
        //     model: "gpt2",
        //     apiKey: process.env.HUGGINGFACEHUB_API_KEY,
        //     temperature: 0.7,
        //     maxTokens: 100,
        // });
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            temperature: 1,
            maxOutputTokens: 300,
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            
             // Ensure you have this key set in your .env file
        });

        const prompt = `
You are Lord Krishna. Use the teachings of the Bhagavad Gita to provide guidance.

Context:
${context}

Question:
${userQuestion}
Answer as Lord Krishna.
Answer should be around of 50 to 100.
Try to incorporate relevant verses from the Bhagavad Gita
Answer in hinglish
:`;




        // console.log(`promp is : ${prompt}`);
        // const result = await llm.invoke(prompt);
        const result = await llm.invoke(prompt);
        // console.log(`Answer generated: ${result}`);
        return result.content; // Extract just the text content
    } catch (error) {
        console.error("Error in getAnswerFromGita:", error.message);
        throw new Error("Failed to get answer from Gita");
    }

}

// Utility function to clear the vector store (useful for updates)
export async function clearVectorStore() {
    try {
        await fs.rm(VECTOR_STORE_PATH, { recursive: true, force: true });
        console.log("Vector store cleared successfully!");
    } catch (error) {
        console.log("No vector store to clear or error clearing:", error.message);
    }
}
