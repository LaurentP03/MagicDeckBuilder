import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Scryfall API proxy routes to avoid CORS issues
  app.get("/api/scryfall/autocomplete", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ data: [] });
      }
      
      const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Scryfall autocomplete error:", error);
      res.status(500).json({ error: "Failed to fetch autocomplete suggestions" });
    }
  });

  app.get("/api/scryfall/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const page = req.query.page || "1";
      
      if (!query || query.length < 2) {
        return res.json({ data: [], total_cards: 0, has_more: false });
      }
      
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&page=${page}&order=name`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return res.json({ data: [], total_cards: 0, has_more: false });
        }
        throw new Error(`Scryfall API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Scryfall search error:", error);
      res.status(500).json({ error: "Failed to search cards" });
    }
  });

  app.get("/api/scryfall/card/:id", async (req, res) => {
    try {
      const cardId = req.params.id;
      const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
      
      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Scryfall card fetch error:", error);
      res.status(500).json({ error: "Failed to fetch card" });
    }
  });

  app.get("/api/scryfall/card-named", async (req, res) => {
    try {
      const name = req.query.name as string;
      if (!name) {
        return res.status(400).json({ error: "Card name is required" });
      }
      
      const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Scryfall card by name error:", error);
      res.status(500).json({ error: "Failed to fetch card by name" });
    }
  });

  app.get("/api/scryfall/card-prints/:id", async (req, res) => {
    try {
      const cardId = req.params.id;
      const response = await fetch(`https://api.scryfall.com/cards/search?q=oracleid%3A${cardId}&unique=prints&order=released`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return res.json({ data: [] });
        }
        throw new Error(`Scryfall API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Scryfall card prints error:", error);
      res.status(500).json({ error: "Failed to fetch card prints" });
    }
  });
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
