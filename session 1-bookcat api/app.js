const express = require("express");
const sql = require("mssql"); // new line
const app = express();

const dbConfig = {
  server: "localhost",
  port: 1433,
  database: "NPBookstore",
  user: "Sarah",
  password: "aliceinchains",
  options: { trustServerCertificate: true },
};

app.get("/db-test", async (req, res) => {
  try {
    const pool = await sql.connect({
      server: "localhost",
      port: 1433,
      database: "NPBookstore",
      user: "Sarah",
      password: "aliceinchains",
      options: { trustServerCertificate: true },
    });

    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS Total FROM Author");
    await pool.close();
    res.json({ connected: true, authors: result.recordset[0].Total });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.get("/categories", (req, res) => {
  res.json([
    { id: 1, name: "Fiction" },
    { id: 2, name: "Non-Fiction" },
    { id: 3, name: "Biography" },
  ]);
});

app.get("/authors", async (req, res) => {
  console.log(req);

  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const result = await connection
      .request()
      .query("SELECT AuthorID, Name FROM Author");

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.delete("/authors/:id", async (req, res) => {
  const authorId = parseInt(req.params.id);
  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", sql.Int, authorId);

    const result = await request.query(
      "DELETE FROM Authors WHERE AuthorID = @id",
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Author not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("Error executing query:", err);
    return res.status(500).json({ message: "Error deleting author" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});
app.post("/authors", async (req, res) => {
  res.send("This endpoint will create a new author");
});

app.get("books/:isbn/copies/:copyNo", async (req, res) => {
  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("isbn", sql.Char(10), req.params.isbn);
    request.input("copyNo", sql.Int, req.params.copyNo);
    const result = await request.query(
      "SELECT * FROM BookCopy WHERE ISBN=@isbn and CopyNo=@copyNo",
    );

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Not found" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
  console.log(req.params.isbn);
  console.log(req.params.copyNo);

  res.send("Get book and copyNo");
});

app.listen(3000, () => {
  console.log("bookcat-api listening on http://localhost:$(port)");
});
