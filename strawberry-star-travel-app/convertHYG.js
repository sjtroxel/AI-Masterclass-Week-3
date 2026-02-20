import fs from "fs";
import path from "path";
import csv from "csv-parser";

// Path to CSV file (relative to script)
const inputFile = path.resolve("../hyg_v42.csv"); 
const outputFile = path.resolve("./stars.json");

const results = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (data) => {
    const star = {
      id: Number(data.id),
      name: data.proper || "",
      designation: data.hip || "",
      distanceLy: parseFloat(data.dist) || 0,
      spectralType: data.spect || "",
      constellation: data.con || "",
      rightAscension: data.ra || "",
      declination: data.dec || "",
      apparentMagnitude: parseFloat(data.mag) || 0,
      x: parseFloat(data.x) || 0,
      y: parseFloat(data.y) || 0,
      z: parseFloat(data.z) || 0
    };
    results.push(star);
  })
  .on("end", () => {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`Converted ${results.length} stars to ${outputFile}`);
  });
