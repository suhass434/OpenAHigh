# CrawlShastra: Document Crawler and Analyzer

## Solution Approach

### Task 1: PDF Metadata Extraction
The solution employs a hybrid approach combining regex pattern matching and LLM (Language Learning Model) for efficient metadata extraction from PDF documents:
- Uses regex for extracting structured fields like document IDs and version numbers
- Leverages LLM capabilities for complex field extraction requiring context understanding
- Implements sliding window technique with overlaps for processing large documents
- Cleans and standardizes extracted metadata before storing in Excel format

### Task 2: Software Compatibility Analysis
The system analyzes software version dependencies and upgrade paths by:
- Cross-referencing against a predefined compatibility matrix
- Applying migration rules to determine required changes
- Generating comprehensive upgrade recommendations
- Identifying dependent software that needs updating

### Task 3: Change Notice Report Generation
For tracking changes between software versions, the system:
- Accumulates changes across intermediate versions
- Categorizes information into new features, fixed issues, and known issues
- Eliminates duplicate entries across versions
- Generates a consolidated report in CSV/MD format

## Implementation Details

### Technologies Used
- **Frontend**: React.js with Redux for state management
- **Backend**: FastAPI (Python)
- **PDF Processing**: PyMuPDF (fitz)
- **Data Processing**: 
  - Regular Expressions for pattern matching
  - Language Learning Models for complex text analysis
  - Pandas for data manipulation and Excel file generation
- **UI Components**: TailwindCSS for styling

### Key Features
- Dark/Light mode support
- Real-time metadata extraction
- Batch processing capability
- Excel/CSV export functionality
- Interactive UI for file management

## Execution Steps

1. **Backend Setup**
   ```bash
   cd Backend
   pip install -r requirements.txt
   python server.py
   ```

2. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm start
   ```

3. **Access Application**
   - Open browser and navigate to `http://localhost:3000`
   - Login with credentials
   - Navigate to desired task interface

## Dependencies

### Backend Dependencies
- Python 3.8+
- FastAPI
- PyMuPDF
- pandas
- python-multipart
- uvicorn

### Frontend Dependencies
- Node.js 14+
- React 18
- Redux Toolkit
- Axios
- TailwindCSS
- Lucide React

## Expected Output

### Task 1: Metadata Extraction
- Extracted metadata fields in structured format
- Excel/CSV file containing:
  - Document ID
  - Affected Product
  - Affected Assets
  - Affected Release
  - Fixed Release
  - PAR Number
  - Configuration

### Task 2: Compatibility Analysis
- Detailed compatibility report
- Required upgrade steps
- List of dependent software updates

### Task 3: Change Notice Report
- Consolidated report containing:
  - New features introduced
  - Issues resolved
  - Known issues
  - Version-wise change tracking
