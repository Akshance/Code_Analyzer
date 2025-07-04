// Add event listener to the 'analyze-btn' button for code analysis
document.getElementById('analyze-btn').addEventListener('click', async () => {
    const codeInput = document.getElementById('code-input').value;
    const resultsDiv = document.getElementById('results');
    const statusIndicator = document.getElementById('status-indicator');
    const syntaxResults = document.getElementById('syntax-results');
    const improvements = document.getElementById('improvements');
    const formattedCodeDiv = document.getElementById('formatted-code');

    if (!codeInput.trim()) {
        // Show error state
        statusIndicator.className = 'status-indicator error';
        
        // Error message HTML with icon
        const errorHTML = `
            <div class="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12" y2="16"></line>
                </svg>
                <span>Please enter some code to analyze</span>
            </div>`;

        // Display error in all sections
        syntaxResults.innerHTML = errorHTML;
        resultsDiv.innerHTML = errorHTML;
        improvements.innerHTML = errorHTML;
        formattedCodeDiv.innerHTML = errorHTML;
        return;
    }

    // Show loading state
    statusIndicator.className = '';
    resultsDiv.innerHTML = '<p class="loading">Analyzing code...</p>';
    syntaxResults.innerHTML = '<p class="loading">Checking syntax...</p>';
    improvements.innerHTML = '<p class="loading">Generating improvements...</p>';
    formattedCodeDiv.innerHTML = '<p class="loading">Formatting code...</p>';

    try {
        // Send code to the backend for analysis
        const response = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: codeInput }),
        });

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        displayError(error);
    }
});

// Function to format and highlight Python code
function formatPythonCode(code) {
    // Basic Python keywords for highlighting
    const keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'import', 'from', 'as', 'return', 'True', 'False', 'None'];
    
    // Split the code into lines and add proper indentation
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map(line => {
        const trimmedLine = line.trim();
        
        // Adjust indent level based on code structure
        if (trimmedLine.endsWith(':')) {
            const currentIndent = '    '.repeat(indentLevel);
            indentLevel++;
            return currentIndent + trimmedLine;
        } else if (trimmedLine.startsWith(('return', 'break', 'continue', 'pass'))) {
            indentLevel = Math.max(0, indentLevel - 1);
            return '    '.repeat(indentLevel) + trimmedLine;
        }
        
        return '    '.repeat(indentLevel) + trimmedLine;
    });

    // Apply syntax highlighting
    let formattedCode = formattedLines.join('\n');
    
    // Highlight keywords
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        formattedCode = formattedCode.replace(regex, `<span class="keyword">${keyword}</span>`);
    });
    
    // Highlight strings
    formattedCode = formattedCode.replace(/(["'])(.*?)\1/g, '<span class="string">$&</span>');
    
    // Highlight numbers
    formattedCode = formattedCode.replace(/\b\d+\b/g, '<span class="number">$&</span>');
    
    // Highlight comments
    formattedCode = formattedCode.replace(/#.*/g, '<span class="comment">$&</span>');
    
    // Highlight function definitions
    formattedCode = formattedCode.replace(/\bdef\s+(\w+)\b/g, 'def <span class="function">$1</span>');
    
    return formattedCode;
}

// Function to display results after analysis
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const statusIndicator = document.getElementById('status-indicator');
    const syntaxResults = document.getElementById('syntax-results');
    const improvements = document.getElementById('improvements');
    const formattedCodeDiv = document.getElementById('formatted-code');

    // Clear previous results
    resultsDiv.innerHTML = '';
    syntaxResults.innerHTML = '';
    improvements.innerHTML = '';
    formattedCodeDiv.innerHTML = '';
    
    // Format and display the code
    const codeInput = document.getElementById('code-input').value;
    formattedCodeDiv.innerHTML = formatPythonCode(codeInput);
    
    // Update status indicator
    if (data.error) {
        statusIndicator.className = 'status-indicator error';
        resultsDiv.innerHTML = `<p class="error-message">${data.error}</p>`;
        return;
    }

    // Display syntax check results
    if (data.syntax) {
        const syntaxClass = data.syntax.status === 'success' ? 'success' : 'error';
        syntaxResults.innerHTML = `
            <div class="syntax-result ${syntaxClass}">
                <p><strong>Status:</strong> ${data.syntax.message}</p>
                ${data.syntax.details ? `<p class="details">${data.syntax.details}</p>` : ''}
            </div>
        `;
    }

    // Display formatting results and improvements
    if (data.formatting) {
        const formattingHtml = `
            <div class="formatting-result">
                <p><strong>Formatting:</strong> ${data.formatting.message}</p>
                ${data.formatting.improvements && data.formatting.improvements.length > 0 ? `
                    <ul>
                        ${data.formatting.improvements.map(imp => `<li>${imp}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
        improvements.innerHTML += formattingHtml;
    }

    // Display general improvements
    if (data.improvements && data.improvements.length > 0) {
        const improvementsHtml = `
            <div class="general-improvements">
                <h4>Suggested Improvements:</h4>
                <ul>
                    ${data.improvements.map(imp => `<li>${imp}</li>`).join('')}
                </ul>
            </div>
        `;
        improvements.innerHTML += improvementsHtml;
    }

    // Display vulnerabilities
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        statusIndicator.className = 'status-indicator error';
        const vulnerabilitiesHtml = data.vulnerabilities.map(vuln => `
            <div class="vulnerability-item">
                <h4>${vuln.issue}</h4>
                <p>${vuln.description}</p>
                <span class="severity ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
                ${vuln.example_fix ? `<p class="fix-suggestion"><strong>Suggested Fix:</strong> ${vuln.example_fix}</p>` : ''}
            </div>
        `).join('');
        resultsDiv.innerHTML = vulnerabilitiesHtml;
    } else {
        statusIndicator.className = 'status-indicator success';
        resultsDiv.innerHTML = '<p class="success-message">No vulnerabilities detected!</p>';
    }
}

// Function to display errors
function displayError(error) {
    const resultsDiv = document.getElementById('results');
    const statusIndicator = document.getElementById('status-indicator');
    const syntaxResults = document.getElementById('syntax-results');
    const improvements = document.getElementById('improvements');
    const formattedCodeDiv = document.getElementById('formatted-code');
    
    statusIndicator.className = 'status-indicator error';
    resultsDiv.innerHTML = `
        <div class="error-message">
            <h4>Error Occurred</h4>
            <p>${error.message}</p>
        </div>
    `;
    syntaxResults.innerHTML = '';
    improvements.innerHTML = '';
    formattedCodeDiv.innerHTML = '';
}
