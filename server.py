# backend/server.py

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Permite requisições do HTML local


@app.route('/compile', methods=['POST'])
def compile_latex():
    data = request.get_json()

    if not data or 'latex' not in data:
        return jsonify({'error': 'Nenhum conteúdo LaTeX recebido.'}), 400

    latex_code = data['latex']

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tex_path = os.path.join(tmpdir, 'doc.tex')
            pdf_path = os.path.join(tmpdir, 'doc.pdf')

            # 1. Salva o arquivo .tex
            with open(tex_path, 'w', encoding='utf-8') as f:
                f.write(latex_code)

            # 2. Compila com pdflatex (2x para resolver referências)
            for _ in range(2):
                resultado = subprocess.run(
                    [
                        'pdflatex',
                        '-interaction=nonstopmode',
                        '-output-directory', tmpdir,
                        tex_path
                    ],
                    capture_output=True,
                    text=True
                )

            # 3. Verifica se o PDF foi gerado
            if not os.path.exists(pdf_path):
                log = resultado.stdout + resultado.stderr
                return jsonify({'error': 'Falha na compilação LaTeX.', 'log': log}), 500

            # 4. Retorna o PDF para o navegador
            return send_file(
                pdf_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='cap1_resumo.pdf'
            )

    except FileNotFoundError:
        return jsonify({
            'error': 'pdflatex não encontrado. Instale o TeX Live ou MiKTeX.'
        }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
