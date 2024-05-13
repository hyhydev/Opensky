import express, { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Get all items
app.get("/items", async (req: Request, res: Response) => {
    try {
        const items = await prisma.item.findMany();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create a new item
app.post("/items", async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        const newItem = await prisma.item.create({
            data: {
                name,
                description,
            },
        });
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get a single item
app.get("/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id!);
    try {
        const item = await prisma.item.findUnique({
            where: {
                id,
            },
        });
        if (!item) {
            res.status(404).json({ error: "Item not found" });
        } else {
            res.json(item);
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete an item
app.delete("/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id!);
    try {
        await prisma.item.delete({
            where: {
                id,
            },
        });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update an item
app.put("/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id!);
    const { name, description } = req.body;
    try {
        const updatedItem = await prisma.item.update({
            where: {
                id,
            },
            data: {
                name,
                description,
            },
        });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
