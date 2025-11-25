from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
import os,sys,inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 
sys.path.insert(0,parentdir + "/scripts") 
import database
import create_book    
import get_html
clanky = database.select_clanky()

# Cesta k React build složce
REACT_BUILD_PATH = os.path.join(parentdir, 'frontend', 'build')
if os.path.exists(REACT_BUILD_PATH):
    # Pokud existuje React build, servuj ho jako statické soubory
    app = Flask(__name__, static_folder=REACT_BUILD_PATH, static_url_path='')
else:
    # Jinak použij standardní Flask app s CORS pro React dev server
    app = Flask(__name__)
    CORS(app)  # Enable CORS for React frontend

# API Routes for React frontend (staré Flask routy byly odstraněny)
@app.route('/api/articles', methods=['GET'])
def api_get_articles():
    """Get all articles as JSON"""
    try:
        clanky = database.select_clanky()
        # Convert tuples to lists for JSON serialization
        # Handle date objects by converting them to strings
        articles = []
        for clanek in clanky.clanky:
            article_list = list(clanek)
            # Convert date to string if it's a date object
            if len(article_list) > 4 and article_list[4] is not None:
                if hasattr(article_list[4], 'isoformat'):
                    article_list[4] = article_list[4].isoformat()
                elif isinstance(article_list[4], str):
                    pass  # Already a string
            articles.append(article_list)
        return jsonify(articles)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/articles/trash', methods=['POST'])
def api_move_to_trash():
    """Move articles to trash"""
    try:
        data = request.get_json()
        id_clanku = data.get('ids', [])
        if not id_clanku:
            return jsonify({'error': 'No article IDs provided'}), 400
        database.insert_book_nechci_cist(id_clanku)
        return jsonify({'success': True, 'message': 'Articles moved to trash'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/create', methods=['POST'])
def api_create_book():
    """Create EPUB book from selected articles"""
    try:
        data = request.get_json()
        id_clanku = data.get('ids', [])
        if not id_clanku:
            return jsonify({'error': 'No article IDs provided'}), 400
        
        kniha = database.insert_book(id_clanku).concatenated_jmena
        os.chdir('/tmp')
        with open('outputweb.txt', 'w') as f:
            f.write(str(kniha))
        tvorbakniha = create_book.create_book(kniha)
        a = database.select_clanky_pro_epub(kniha)
        for b in a.clanky:
            tvorbakniha.add_kap(b[2],b[1],b[3],b[4],b[5],b[6])
        tvorbakniha.write_knihu(kniha)
        file = kniha + ".epub"
        file_path = '/tmp/' + file
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Book file was not created'}), 500
        
        return send_file(file_path, as_attachment=True, download_name=file)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/articles/load', methods=['POST'])
def api_load_articles():
    """Load articles from sites"""
    try:
        get_html.main_throuhgh_sites()
        return jsonify({'success': True, 'message': 'Articles loaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve React app for production build
# Tato routa musí být na konci, aby zachytila všechny cesty kromě API
# Flask routy se matchují v pořadí, takže API routy výše mají prioritu
if os.path.exists(REACT_BUILD_PATH):
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        """Serve React app - catch all routes except /api/* and serve index.html for client-side routing"""
        # Explicitně vyloučit API cesty (i když by se neměly sem dostat kvůli prioritě rout výše)
        if path.startswith('api/'):
            return jsonify({'error': 'API endpoint not found'}), 404
        
        # Pokud je to statický soubor (CSS, JS, obrázky), servuj ho
        static_file_path = os.path.join(REACT_BUILD_PATH, path)
        if path and os.path.exists(static_file_path) and os.path.isfile(static_file_path):
            return send_from_directory(REACT_BUILD_PATH, path)
        
        # Jinak servuj index.html pro React Router (všechny ostatní cesty)
        return send_from_directory(REACT_BUILD_PATH, 'index.html')
else:
    # Pokud React build neexistuje, servuj jednoduchou zprávu
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_dev(path):
        """Informace o tom, že React build neexistuje"""
        # API cesty by se sem neměly dostat, ale pro jistotu
        if path.startswith('api/'):
            return jsonify({'error': 'API endpoint not found'}), 404
        
        return jsonify({
            'error': 'React build not found',
            'message': 'Please run "./build_react.sh" to create production build, or use React dev server on port 3000'
        }), 503

