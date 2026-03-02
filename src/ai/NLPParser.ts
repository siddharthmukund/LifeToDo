import * as chrono from 'chrono-node';

export interface ParsedTask {
    rawText: string;
    cleanText: string;
    dueDate: Date | null;
    projects: string[];
    contexts: string[];
}

/**
 * Strips out found dates, projects (#), and contexts (@) from the raw string
 * and returns structured data. Runs entirely offline.
 */
export function parseTaskOffline(input: string): ParsedTask {
    let cleanText = input;
    let dueDate: Date | null = null;

    // 1. DATES using chrono-node
    // chrono-node is very powerful: "tomorrow at 5pm", "next friday", etc.
    const dateResults = chrono.parse(cleanText);

    if (dateResults.length > 0) {
        // Take the first matching date (could be refined to take the most confident)
        const firstMatch = dateResults[0];
        dueDate = firstMatch.start.date();

        // Remove the date string from the clean text
        // e.g., "Call Mom tomorrow at 5pm" -> "Call Mom "
        cleanText = cleanText.replace(firstMatch.text, '');
    }

    // 2. PROJECTS using # tags
    const projects: string[] = [];
    // Regex matches #word, #Word-With-Dashes, #"Project with spaces"
    const projectRegex = /#(\w[\w-]*|"[^"]+")/g;
    let match;
    while ((match = projectRegex.exec(input)) !== null) {
        const rawTag = match[0];
        const projectName = match[1].replace(/"/g, ''); // strip quotes if present
        projects.push(projectName);
        cleanText = cleanText.replace(rawTag, '');
    }

    // 3. CONTEXTS using @ tags
    const contexts: string[] = [];
    const contextRegex = /@(\w[\w-]*|"[^"]+")/g;
    while ((match = contextRegex.exec(input)) !== null) {
        const rawTag = match[0];
        const contextName = match[1].replace(/"/g, '');
        contexts.push(contextName);
        cleanText = cleanText.replace(rawTag, '');
    }

    // 4. Cleanup remaining whitespaces and punctuation 
    // Example: "Call Mom tomorrow at 5pm #Family @Phone" -> "Call Mom"
    cleanText = cleanText.trim().replace(/\s{2,}/g, ' ');

    // Normalize output
    return {
        rawText: input,
        cleanText,
        dueDate,
        projects,
        contexts
    };
}
