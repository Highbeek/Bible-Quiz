const jsonServer = require("json-server");
const path = require("path");
const express = require("express");

const server = jsonServer.create();
const router = jsonServer.router("data/Questions.json");
const middlewares = jsonServer.defaults();

// Serve React static files
server.use(express.static(path.join(__dirname, "build")));

// JSON Server middlewares
server.use(middlewares);

// API routes
server.use("/api", router);

// Catch-all handler for React
server.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`JSON Server with React started on http://localhost:${PORT}`);
});
