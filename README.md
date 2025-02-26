# AI HTML Modifier

This application uses the Claude AI API to modify HTML files based on natural language requests.

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

## Usage

Run the application with a natural language request describing the changes you want to make to the HTML file:

```bash
node app.js "Your modification request here"
```

For example:

```bash
node app.js "Change the counter color to blue and add a title that says 'My Counter App'"
```

The application will:

1. Read the original HTML file (`original.html`)
2. Use the prompt template from `prompt.txt` to format the request to Claude
3. Send your request to the Claude API with a system prompt identifying it as a "Code modification assistant"
4. Parse the modification instructions from Claude
5. Apply the changes to create a new file (`modified.html`)

## How It Works

The application uses Claude to generate HTML modification instructions in a specific format:

- `### ADD after line X` - Adds content after a specific line
- `### REPLACE lines X-Y` - Replaces content between specific lines
- `### DELETE lines X-Y` - Deletes content between specific lines

These instructions are then parsed and applied to the original HTML file.

### Prompt Template

The application uses a prompt template from `prompt.txt` that contains placeholders:

- `%code%` - Will be replaced with the content of the original HTML file
- `%user-request%` - Will be replaced with the user's modification request

You can customize this prompt template to change how Claude interprets and responds to modification requests.

### System Prompt

The application uses a system prompt to instruct Claude to act as a "Code modification assistant." This helps guide Claude's responses to be more focused on code modification tasks.

## Requirements

- Node.js
- An Anthropic API key (Claude)
