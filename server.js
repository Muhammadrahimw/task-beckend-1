import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const PORT = 4040;
const HOST = "localhost";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
	const dbPath = path.join(__dirname, "db.json");
	const rawData = fs.readFileSync(dbPath, "utf8");
	const data = JSON.parse(rawData);
	const reqId = req.url.split(`/`)[1];

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}
	res.writeHead(200, {"Content-Type": "application/json"});

	if (req.method === "GET") {
		if (reqId) {
			const reqProduct = data.find((product) => product.id == reqId);
			if (reqProduct) {
				return res.end(JSON.stringify(reqProduct, null, 4));
			}
			return res.end("Data not found");
		}
		return res.end(JSON.stringify(data, null, 4));
	}
	if (req.method === "POST") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			console.log(body);
			const parsedBody = JSON.parse(body);
			if (
				parsedBody.title &&
				parsedBody.price &&
				parsedBody.description &&
				parsedBody.category &&
				parsedBody.image &&
				parsedBody.rating.rate &&
				parsedBody.rating.count
			) {
				data.push({id: data.length + 1, ...parsedBody});
				fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
				return res.end(
					JSON.stringify({
						message: "Added product",
						product: {id: data.length + 1, ...parsedBody},
					})
				);
			}
			return res.end("Data is failed");
		});
	}
	if (req.method === "PUT") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			const parsedBody = JSON.parse(body);
			if (
				reqId &&
				parsedBody.name &&
				parsedBody.surname &&
				parsedBody.age &&
				parsedBody.location &&
				parsedBody.salary
			) {
				const updatedProduct = data.map((product) =>
					product.id == reqId ? {...parsedBody, id: product.id} : product
				);
				fs.writeFileSync(dbPath, JSON.stringify(updatedProduct, null, 4));
				return res.end(
					JSON.stringify({
						message: "Product updated",
					})
				);
			}
			return res.end("Updating is failed");
		});
	}
	if (req.method === "DELETE") {
		if (reqId) {
			fs.writeFileSync(
				dbPath,
				JSON.stringify(
					data.filter((product) => product.id != reqId),
					null,
					4
				)
			);
			return res.end(JSON.stringify({message: "Product deleted"}));
		}
		return res.end(JSON.stringify({message: "Deleting is failed"}));
	}
});

server.listen(PORT, HOST, () => {
	console.log(`server ishga tushdi`);
});
