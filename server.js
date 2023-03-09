// var express = require("express");
// var cors = require("cors");
// var app = express();
// // get the client
// const mysql = require("mysql2");

// // create the connection to database
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "travel",
// });

// app.use(cors());

// app.get("/api/attractions", function (req, res, next) {
//   // simple query
//   const page = parseInt(req.query.page);
//   const per_page = parseInt(req.query.per_page);
//   const sort_column = req.query.sort_column;
//   const sort_direction = req.query.sort_direction;
//   const search = req.query.search;

//   const start_idex = (page - 1) * per_page;
//   var params = [];
//   var sql = "SELECT * FROM attractions";
//   if (search) {
//     sql += " WHERE name LIKE ?";
//     params.push("%" + search + "%");
//   }
//   if (sort_column) {
//     sql += " ORDER BY " + sort_column + " " + sort_direction;
//   }
//   sql += " LIMIT ?, ?";
//   params.push(start_idex);
//   params.push(per_page);
//   console.log(params);
//   console.log(sql);
//   connection.execute(sql, params, function (err, results, fields) {
//     console.log(results); // results contains rows returned by server
//     console.log(fields); // fields contains extra meta data about results, if available
//     res.json({ results: results });
//     // If you execute same statement again, it will be picked from a LRU cache
//     // which will save query preparation time and give better performance
//   });
// });

// app.listen(5000, function () {
//   console.log("CORS-enabled web server listening on port 5000");
// });
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 5000;
const DB_CONFIG = {
  host: "localhost",
  user: "root",
  database: "travel",
};

app.use(cors());

async function getAttractions(req, res, next) {
  try {
    const { page, per_page, sort_column, sort_direction, search } = req.query;
    const start_index = (page - 1) * per_page;
    const sqlParams = [];
    let sql = "SELECT * FROM attractions";
    if (search) {
      sql += " WHERE name LIKE ?";
      sqlParams.push(`%${search}%`);
    }
    if (sort_column) {
      sql += ` ORDER BY ${sort_column} ${sort_direction}`;
    }
    sql += " LIMIT ?, ?";
    sqlParams.push(start_index);
    sqlParams.push(per_page);
    console.log(sql);
    console.log(sqlParams);
    // SELECT * FROM attractions WHERE name LIKE ? ORDER BY name asc LIMIT ?, ?

    const connection = await mysql.createConnection(DB_CONFIG);
    const [results] = await connection.execute(sql, sqlParams);
    await connection.end();

    res.json({ results });
  } catch (error) {
    next(error);
  }
}

app.get("/api/attractions", getAttractions);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
