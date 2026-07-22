# Thiruppugazh API

A modern REST API built with Python for the Thiruppugazh project.

## Table of Contents

- [Technical Details](#technical-details)
- [Prerequisites](#prerequisites)
- [Virtual Environment Setup](#virtual-environment-setup)
- [Installation](#installation)
- [Build](#build)
- [Running the Application](#running-the-application)
- [Development](#development)

## Technical Details

- **Language**: Python 3.9+
- **Framework**: Flask/FastAPI (update as needed)
- **Package Manager**: pip
- **Environment Management**: venv
- **Port**: 5000 (default)

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.9 or higher
- pip (Python package manager)
- Git

Verify installation:
```bash
python3 --version
pip --version
```

## Virtual Environment Setup

### Create Virtual Environment

```bash
python3 -m venv venv
```

### Activate Virtual Environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### Deactivate Virtual Environment

```bash
deactivate
```

## Installation

1. Ensure your virtual environment is activated
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Verify installation:

```bash
pip list
```

## Build

To prepare the application for deployment:

```bash
# Install build tools (if needed)
pip install build

# Build the package
python -m build
```

## Running the Application

### Development Server

```bash
python app.py
```

or

```bash
flask run
```

The API will be available at `http://localhost:5000`

### Production Server

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Development

### Code Style

Follow PEP 8 standards for Python code.

### Running Tests

```bash
python -m pytest
```

### Generating Requirements File

After installing dependencies, export them:

```bash
pip freeze > requirements.txt
```

---

For more information or issues, please open an issue on GitHub.