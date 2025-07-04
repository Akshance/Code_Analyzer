import pandas as pd
import os
import ast

# Load the dataset
def load_vulnerability_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "datasets", "vulnerabilities.csv")
    try:
        return pd.read_csv(dataset_path)
    except FileNotFoundError:
        print(f"Dataset not found at {dataset_path}. Ensure 'vulnerabilities.csv' exists in the 'datasets/' folder.")
        return None

# Detect vulnerabilities using the dataset
def detect_vulnerabilities(code, dataset):
    matches = []
    for _, row in dataset.iterrows():
        if row['pattern'] in code:
            matches.append({
                "issue": row['issue'],
                "description": row['description'],
                "severity": row['severity'],
                "example_fix": row['example_fix']
            })
    return matches

# Syntax check function with detailed error information
def check_syntax(code):
    try:
        ast.parse(code)
        return {
            "status": "success",
            "message": "No syntax errors detected.",
            "details": "The code is syntactically correct and can be executed."
        }
    except SyntaxError as e:
        line_num = e.lineno if hasattr(e, 'lineno') else 'unknown'
        col_num = e.offset if hasattr(e, 'offset') else 'unknown'
        return {
            "status": "error",
            "message": f"Syntax error on line {line_num}, column {col_num}: {str(e)}",
            "details": f"Error type: {type(e).__name__}\nFull error: {str(e)}"
        }

# Code formatting and style check function
def format_code(code):
    improvements = []
    
    # Check line length
    for i, line in enumerate(code.split('\n'), 1):
        if len(line.strip()) > 79:
            improvements.append(f"Line {i} exceeds PEP 8's recommended maximum length of 79 characters")
    
    # Check basic indentation
    if '    ' in code and '\t' in code:
        improvements.append("Mixed usage of tabs and spaces found. Stick to 4 spaces for indentation")
    
    # Check trailing whitespace
    if any(line.rstrip() != line for line in code.split('\n')):
        improvements.append("Trailing whitespace found in some lines")
    
    return {
        "status": "success" if not improvements else "warning",
        "message": "Code formatting analysis completed",
        "improvements": improvements
    }

# Generate improvement suggestions
def generate_improvements(code, vulnerabilities):
    suggestions = []
    
    # Add general security improvements
    if vulnerabilities:
        suggestions.append("Consider implementing input validation for all user inputs")
        suggestions.append("Add error handling with try-except blocks around risky operations")
        
    # Add specific improvements based on code content
    if 'print(' in code:
        suggestions.append("Consider using a proper logging system instead of print statements")
    if 'except:' in code:
        suggestions.append("Avoid bare except clauses. Catch specific exceptions instead")
    if 'global ' in code:
        suggestions.append("Minimize use of global variables to improve code maintainability")
    
    return suggestions

# Main analysis function
def analyze_code(code):
    dataset = load_vulnerability_data()
    if dataset is None:
        return {"error": "Dataset not loaded. Cannot perform vulnerability analysis."}

    # Step 1: Syntax check
    syntax_result = check_syntax(code)

    # Step 2: Code formatting
    format_result = format_code(code)

    # Step 3: Vulnerability detection
    vulnerabilities = detect_vulnerabilities(code, dataset)

    # Step 4: Generate improvements
    improvement_suggestions = generate_improvements(code, vulnerabilities)

    return {
        "syntax": syntax_result,
        "formatting": format_result,
        "vulnerabilities": vulnerabilities,
        "improvements": improvement_suggestions
    }
