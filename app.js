import fs from "node:fs";
import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { modifyHtml } from "./libs/htmlModifier.js";
dotenv.config();

// Initialize Claude client
const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

async function processUserRequest(originalHtml, userRequest) {
	try {
		// Read the prompt template from prompt.txt
		let promptTemplate = fs.readFileSync("prompt.txt", "utf8");

		// Replace placeholders in the prompt template
		promptTemplate = promptTemplate.replace("%code%", originalHtml);
		promptTemplate = promptTemplate.replace("%user-request%", userRequest);

		// Call Claude API to get modification instructions
		const response = await anthropic.messages.create({
			model: "claude-3-7-sonnet-20250219",
			max_tokens: 8000,
			system: "You are a Code modification assistant.",
			messages: [
				{
					role: "user",
					content: promptTemplate,
				},
			],
		});

		// Extract the content from Claude's response
		const claudeResponse = response.content[0].text;
		return claudeResponse;
	} catch (error) {
		console.error("Error calling Claude API:", error);
		throw error;
	}
}

function addLineNumbers(code) {
	const lines = code.split("\n");
	const numberedLines = lines.map((line, index) => {
		const lineNumber = index + 1;
		return `${lineNumber}: ${line}`;
	});
	return numberedLines.join("\n");
}

// If this file is run directly
async function main() {
	const userRequest = `Make it look like this is a paper design with a white background and a black border. Add grids and modern aesthetics. make it mobile responsive.
	Add a background gradient that animates. Create sophisticated effects on button clicks and counter change.`;
	// const userRequest = `Change fonts and colors for gradients to look like a spaceship modern tesla style`;
	// Open original.html
	const inputString = fs.readFileSync("original.html", "utf8");
	const numberedInputString = addLineNumbers(inputString);

	if (!userRequest) {
		console.error(
			"Please provide a modification request as a command line argument",
		);
		console.log('Example: node app.js "Change the counter color to blue"');
		process.exit(1);
	}

	const claudeResponse = await processUserRequest(
		numberedInputString,
		userRequest,
	);
	fs.writeFileSync("claudeResponse.txt", claudeResponse);

	const modifiedHtml = await modifyHtml(inputString, claudeResponse);

	fs.writeFileSync("modified.html", modifiedHtml);
}

main();
