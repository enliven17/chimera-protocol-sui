#!/usr/bin/env python3

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import random

class ASIAgentHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'online',
                'version': '1.0.0',
                'agent_type': 'ASI Alliance MeTTa Agent',
                'capabilities': ['market_analysis', 'contrarian_strategy', 'sentiment_analysis'],
                'uptime': int(time.time())
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/analyze-market':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Mock market analysis response
            response = {
                'marketId': data.get('marketId', '1'),
                'confidence': random.uniform(0.6, 0.9),
                'recommendation': random.choice(['optionA', 'optionB', 'abstain']),
                'reasoning': f"Based on MeTTa reasoning analysis of market '{data.get('title', 'Unknown')}', considering historical patterns and current market sentiment.",
                'factors': [
                    {
                        'name': 'Market Sentiment',
                        'weight': 0.3,
                        'value': random.uniform(-1, 1),
                        'description': 'Overall market sentiment analysis'
                    },
                    {
                        'name': 'Historical Patterns',
                        'weight': 0.4,
                        'value': random.uniform(-1, 1),
                        'description': 'Pattern recognition from historical data'
                    },
                    {
                        'name': 'Volume Analysis',
                        'weight': 0.3,
                        'value': random.uniform(-1, 1),
                        'description': 'Trading volume and liquidity analysis'
                    }
                ],
                'riskAssessment': {
                    'level': random.choice(['low', 'medium', 'high']),
                    'factors': ['Market volatility', 'Limited historical data', 'External events impact']
                },
                'expectedValue': random.uniform(0.1, 0.3),
                'timestamp': int(time.time())
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        elif parsed_path.path == '/contrarian-analysis':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'marketId': data.get('marketId', '1'),
                'isContrarianOpportunity': random.choice([True, False]),
                'crowdBias': random.choice(['optionA', 'optionB', 'neutral']),
                'biasStrength': random.uniform(0.1, 0.8),
                'contrarian_recommendation': random.choice(['optionA', 'optionB', 'none']),
                'reasoning': 'Contrarian analysis suggests potential market overreaction based on crowd psychology patterns.',
                'confidence': random.uniform(0.5, 0.8),
                'expectedCorrection': random.uniform(0.05, 0.25)
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        elif parsed_path.path == '/sentiment-analysis':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'marketId': data.get('marketId', '1'),
                'overallSentiment': random.choice(['positive', 'negative', 'neutral']),
                'sentimentScore': random.uniform(-1, 1),
                'sources': [
                    {
                        'platform': 'twitter',
                        'sentiment': random.uniform(-1, 1),
                        'volume': random.randint(100, 1000),
                        'reliability': random.uniform(0.6, 0.9)
                    },
                    {
                        'platform': 'reddit',
                        'sentiment': random.uniform(-1, 1),
                        'volume': random.randint(50, 500),
                        'reliability': random.uniform(0.7, 0.9)
                    }
                ],
                'trendDirection': random.choice(['increasing', 'decreasing', 'stable']),
                'keyTopics': ['market_prediction', 'price_movement', 'community_sentiment'],
                'timestamp': int(time.time())
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def run_server(port=8001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ASIAgentHandler)
    print(f'🤖 ASI Agent Mock Server running on port {port}')
    print(f'   Status: http://localhost:{port}/status')
    print(f'   Analysis: POST http://localhost:{port}/analyze-market')
    print('   Press Ctrl+C to stop')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n🛑 ASI Agent server stopped')
        httpd.server_close()

if __name__ == '__main__':
    run_server()