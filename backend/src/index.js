import express from "express";
import dotenv from "dotenv";
import readline from "readline";
import { initRAG, getAnswerFromGita } from "./rag.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors()); // Adjust the origin as needed
app.use(express.json());

app.listen(3000, async () => {
    console.log("Server running on http://localhost:3000");
    await initRAG();
    console.log("Gita embeddings initialized.");
});

app.post("/ask", async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "No question provided" });

    try {
        const answer = await getAnswerFromGita(question);
        res.json({ answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error", detail: err.message });
    }
});

// Console interface for asking questions
async function startConsoleInterface() {
    await initRAG(); // Ensure RAG is initialized before starting console

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // while (true) {
    //     const input = await new Promise(resolve => {
    //         rl.question("enter question and have answer on the basis of Bhagwata gita:/n",(answer) => {
    //             resolve(answer);
    //         });
    //     });

    //     if (input.toLowerCase() === "exit") {
    //         console.log("Exiting...");
    //         rl.close();
    //         break;
    //     }

    //     console.log("You asked:", input);
    //     try {
    //         const answer = await getAnswerFromGita(input);
    //         console.log("Answer:", JSON.stringify(answer.content));
    //     } catch (err) {
    //         console.error("Error getting answer:", err.message);
    //     }
    // }
}

// Start console interface after server is running
// setTimeout(startConsoleInterface, 1000);
