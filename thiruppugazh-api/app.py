from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Flasgger
import os
import json
import random
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Initialize Swagger/OpenAPI
swagger = Flasgger(app)

# Configuration
app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', True)

# =====================
# Database Loader
# =====================

class SongsDB:
    def __init__(self, songs_dir='songs'):
        self.songs_dir = Path(songs_dir)
        self.songs_index = []
        self.places_index = {}
        self.ragas_set = set()
        self.thalas_set = set()
        self.load_songs()
    
    def load_songs(self):
        """Load all JSON files from songs directory"""
        if not self.songs_dir.exists():
            print(f"Songs directory '{self.songs_dir}' not found")
            return
        
        json_files = sorted(self.songs_dir.glob('*.json'))
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    # Handle if data is a list of songs
                    if isinstance(data, list):
                        songs_to_process = data
                    else:
                        songs_to_process = [data]
                    
                    for song_data in songs_to_process:
                        if not isinstance(song_data, dict):
                            continue
                            
                        self.songs_index.append(song_data)
                        
                        # Index places
                        if 'place' in song_data:
                            place = song_data['place']
                            if place not in self.places_index:
                                self.places_index[place] = []
                            self.places_index[place].append(song_data.get('song_number'))
                        
                        # Index ragas and thalas
                        if 'raga' in song_data:
                            self.ragas_set.add(song_data['raga'])
                        if 'thala' in song_data:
                            self.thalas_set.add(song_data['thala'])
                        
            except json.JSONDecodeError as e:
                print(f"Error parsing {json_file}: {e}")
            except Exception as e:
                print(f"Error loading {json_file}: {e}")
        
        print(f"Loaded {len(self.songs_index)} songs from {len(json_files)} files")
        print(f"Places indexed: {len(self.places_index)}")
    
    def search_songs(self, query=None, place=None, raga=None, thala=None, chandam=None):
        """Search and filter songs"""
        results = [s for s in self.songs_index if isinstance(s, dict)]
        
        if query:
            query_lower = query.lower()
            results = [s for s in results if 
                      query_lower in str(s.get('title', '')).lower() or
                      query_lower in str(s.get('lyrics', '')).lower() or
                      query_lower in str(s.get('place', '')).lower()]
        
        if place:
            results = [s for s in results if s.get('place', '').lower() == place.lower()]
        
        if raga:
            results = [s for s in results if s.get('raga', '').lower() == raga.lower()]
        
        if thala:
            results = [s for s in results if s.get('thala', '').lower() == thala.lower()]
        
        if chandam:
            results = [s for s in results if s.get('chandam', '').lower() == chandam.lower()]
        
        return results
    
    def get_song_by_number(self, song_number):
        """Get song by song number"""
        for song in self.songs_index:
            # Skip if song is not a dictionary
            if not isinstance(song, dict):
                continue
            if song.get('song_number') == song_number:
                return song
        return None

# Initialize database
db = SongsDB(songs_dir='songs')

# =====================
# Health & Status Routes
# =====================

@app.route('/', methods=['GET'])
def home():
    """
    Root endpoint - API information
    ---
    responses:
      200:
        description: API information
        schema:
          properties:
            message:
              type: string
            status:
              type: string
            version:
              type: string
    """
    return jsonify({
        'message': 'Thiruppugazh API',
        'status': 'running',
        'version': '0.1.0',
        'environment': app.config['ENV'],
        'total_songs': len(db.songs_index)
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running',
        'songs_loaded': len(db.songs_index)
    }), 200

# =====================
# Song Listing & Search
# =====================

@app.route('/api/songs', methods=['GET'])
def get_songs():
    """
    Search and filter songs with pagination
    ---
    parameters:
      - name: q
        in: query
        type: string
        description: Search term for lyrics, title, or place
      - name: place
        in: query
        type: string
        description: Filter by place or category
      - name: raga
        in: query
        type: string
        description: Filter by raga
      - name: thala
        in: query
        type: string
        description: Filter by thala
      - name: chandam
        in: query
        type: string
        description: Filter by chandam pattern
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number
      - name: limit
        in: query
        type: integer
        default: 20
        description: Items per page
    responses:
      200:
        description: Paginated song results
    """
    q = request.args.get('q', None)
    place = request.args.get('place', None)
    raga = request.args.get('raga', None)
    thala = request.args.get('thala', None)
    chandam = request.args.get('chandam', None)
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    
    all_matched = db.search_songs(query=q, place=place, raga=raga, thala=thala, chandam=chandam)
    
    total = len(all_matched)
    start = (page - 1) * limit
    end = start + limit
    paginated_results = all_matched[start:end]

    return jsonify({
        "total": total,
        "page": page,
        "limit": limit,
        "results": paginated_results
    }), 200

# =====================
# Random Song
# =====================

@app.route('/api/songs/random', methods=['GET'])
def get_random_song():
    """
    Get a random Thiruppugazh song
    ---
    responses:
      200:
        description: Random song object
      404:
        description: No songs available
    """
    if not db.songs_index:
        return jsonify({'error': 'No songs available in database'}), 404
    
    random_song = random.choice(db.songs_index)
    return jsonify(random_song), 200

# =====================
# Individual Song Detail
# =====================

@app.route('/api/songs/<int:song_number>', methods=['GET'])
def get_song_detail(song_number):
    """
    Get song by song number
    ---
    parameters:
      - name: song_number
        in: path
        type: integer
        required: true
        description: Song number
    responses:
      200:
        description: Song detail with lyrics and metadata
      404:
        description: Song not found
    """
    song = db.get_song_by_number(song_number)
    if not song:
        return jsonify({'error': f'Song number {song_number} not found'}), 404
    return jsonify(song), 200

# =====================
# Metadata Endpoints
# =====================

@app.route('/api/places', methods=['GET'])
def get_places():
    """
    Get all places/temples
    ---
    responses:
      200:
        description: List of all places with song counts
    """
    places_list = [
        {'place': place, 'count': len(songs), 'song_numbers': songs}
        for place, songs in sorted(db.places_index.items())
    ]
    return jsonify(places_list), 200

@app.route('/api/ragas', methods=['GET'])
def get_ragas():
    """
    Get all distinct ragas
    ---
    responses:
      200:
        description: List of all ragas
    """
    ragas = sorted(list(db.ragas_set))
    return jsonify(ragas), 200

@app.route('/api/thalas', methods=['GET'])
def get_thalas():
    """
    Get all distinct thalas
    ---
    responses:
      200:
        description: List of all thalas
    """
    thalas = sorted(list(db.thalas_set))
    return jsonify(thalas), 200

# =====================
# Error Handlers
# =====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource does not exist',
        'status': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred',
        'status': 500
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)