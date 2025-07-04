from flask import Flask, request, jsonify, render_template
from analysis_tools import analyze_code
from flask_cors import CORS

# Initialize Flask application
app = Flask(__name__, template_folder="../frontend", static_folder="../frontend")
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS)

# Endpoint for analyzing Python code
@app.route('/analyze', methods=['POST'])
def analyze_code_endpoint():
    # Ensure the request contains JSON data
    if not request.is_json:  
        return jsonify({"status": "error", "message": "Invalid JSON format."}), 400

    # Get JSON data from the request
    data = request.get_json()
    code = data.get('code', '')  # Extract code from the JSON

    # If no code is provided, return an error message
    if not code:
        return jsonify({"status": "error", "message": "No code provided."}), 400

    # Perform code analysis using the provided code
    analysis_results = analyze_code(code)

    # Return the analysis results as a JSON response
    return jsonify(analysis_results)

# Serve the frontend (HTML page)
@app.route('/')
def home():
    return render_template('index.html')  # Render the index.html page from the frontend folder

# Start the Flask server if this file is executed directly
if __name__ == "__main__":
    app.run(debug=True)
