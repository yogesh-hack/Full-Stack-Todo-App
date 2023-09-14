import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MongoDB_URL; 

// Middleware for JSON parsing
app.use(express.json());

// Connect to MongoDB Atlas
const client = new MongoClient(mongoURI);

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const db = client.db('Todo-App'); 
        const collection = db.collection('todos');

        // Create a new todo
        app.post('/api/todos', async (req, res) => {
            const todo = req.body;
            const result = await collection.insertOne(todo);
            if (result.acknowledged) {
                res.status(201).json({ _id: result.insertedId, ...todo });
            } else {
                res.status(500).json({ error: 'Failed to insert todo' });
            }
        });


        // Read all todos
        app.get('/api/todos', async (req, res) => {
            const todos = await collection.find({}).toArray();
            res.json(todos);
        });

        // Read a todo by ID
        app.get('/api/todos/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const todo = await collection.findOne({ _id: id });
            if (!todo) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            res.json(todo);
        });

        // Update a todo by ID
        app.put('/api/todos/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const updatedTodo = req.body;
            const result = await collection.updateOne({ _id: id }, { $set: updatedTodo });
            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            res.json({ message: 'Todo updated successfully' });
        });

        // Delete a todo by ID
        app.delete('/api/todos/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const result = await collection.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Todo not found' });
            }
            res.json({ message: 'Todo deleted successfully' });
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
}

startServer();
