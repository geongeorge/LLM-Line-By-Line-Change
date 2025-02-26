/**
 * Parse changes from Claude's response
 * @param {string} response - Claude's response with modification instructions
 * @returns {Array} Array of change objects
 */
function parseChanges(response) {
	const changes = [];
	const sections = response.split("### ").filter(Boolean);

	for (const section of sections) {
		const [header, ...contentLines] = section.trim().split("\n");
		const content = contentLines.join("\n").trim();

		if (header.startsWith("ADD after line")) {
			const lineNum = Number.parseInt(header.match(/line (\d+)/)[1]);
			changes.push({ type: "add", afterLine: lineNum, content });
		} else if (header.startsWith("REPLACE lines")) {
			const [from, to] = header
				.match(/lines (\d+)-(\d+)/)
				.slice(1)
				.map(Number);
			changes.push({
				type: "replace",
				fromLine: from,
				toLine: to,
				newContent: content,
			});
		} else if (header.startsWith("DELETE lines")) {
			const [from, to] = header
				.match(/lines (\d+)-(\d+)/)
				.slice(1)
				.map(Number);
			changes.push({ type: "delete", fromLine: from, toLine: to });
		}
	}

	return changes;
}

/**
 * Modify HTML based on a user request
 * @param {string} inputString - The input HTML string
 * @param {string} claudeResponse - Claude's modification instructions
 * @returns {Array} Array of applied changes
 */
export async function modifyHtml(inputString, claudeResponse) {
	// Load original HTML
	const originalHtml = inputString;
	const originalLines = originalHtml.split("\n");
	const newLines = [...originalLines];

	// Parse changes using the format
	const changes = parseChanges(claudeResponse);

	// Sort changes in reverse line order (to avoid index shifting issues)
	changes.sort((a, b) => {
		const lineA = a.type === "add" ? a.afterLine : a.fromLine;
		const lineB = b.type === "add" ? b.afterLine : b.fromLine;
		return lineB - lineA;
	});

	// Apply changes
	for (const change of changes) {
		if (change.type === "replace") {
			newLines.splice(
				change.fromLine - 1,
				change.toLine - change.fromLine + 1,
				...change.newContent.split("\n"),
			);
		} else if (change.type === "add") {
			newLines.splice(change.afterLine, 0, change.content.split("\n"));
		} else if (change.type === "delete") {
			newLines.splice(change.fromLine - 1, change.toLine - change.fromLine + 1);
		}
	}

	const modifiedHtml = newLines.join("\n");
	return modifiedHtml;
}
