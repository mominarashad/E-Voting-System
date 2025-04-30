from flask import Flask, request, jsonify
import random, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import mysql.connector
from flask_cors import CORS
import base64, cv2, numpy as np, face_recognition
import hashlib, json
from web3 import Web3
from solcx import compile_source, install_solc, set_solc_version
from functools import wraps
from flask import g
from functools import wraps
from datetime import datetime, timedelta
from flask_socketio import SocketIO, emit
import jwt
# === Ethereum Setup ===
install_solc("0.8.0")
set_solc_version("0.8.0")
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
with open("VotingContract.sol", "r") as file:
    contract_source = file.read()
compiled_sol = compile_source(contract_source, output_values=['abi', 'bin'])
contract_id, contract_interface = compiled_sol.popitem()
abi = contract_interface['abi']
bytecode = contract_interface['bin']

acct = w3.eth.accounts[0]
w3.eth.default_account = acct
VoteContract = w3.eth.contract(abi=abi, bytecode=bytecode)
tx_hash = VoteContract.constructor().transact()
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract = w3.eth.contract(address=tx_receipt.contractAddress, abi=abi)

# === Flask Setup ===
app = Flask(__name__)
CORS(app, supports_credentials=True)

# === MySQL Setup ===
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Momina0192004.",
    database="electrovoting"
)
cursor = db.cursor(dictionary=True)
SECRET_KEY = "Momina0192004."
ADMIN_SECRET_CODE = "admin123"
def require_valid_session(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        print(f"Session Token: {token}")
        if not token:
            return jsonify({"message": "Missing session token"}), 401

        cursor.execute("SELECT * FROM sessions WHERE token = %s", (token,))
        session = cursor.fetchone()

        if not session:
            return jsonify({"message": "Invalid session token"}), 403

        if datetime.now() > session['expires_at']:
            return jsonify({"message": "Session expired, please login again"}), 403

        if session['ip_address'] != request.remote_addr:
            return jsonify({"message": "IP mismatch detected, session invalidated"}), 403

        new_expiry = datetime.now() + timedelta(minutes=5)
        cursor.execute("UPDATE sessions SET expires_at = %s WHERE id = %s", (new_expiry, session['id']))
        db.commit()

        g.session = session  # ✅ store in flask.g, not request.session

        return func(*args, **kwargs)
    return wrapper
# === Blockchain Setup ===
class Blockchain:
    def __init__(self):
        self.chain = []
        self.pending_votes = []
        self.create_block(proof=1, previous_hash='0')

    def create_block(self, proof, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': str(datetime.now()),
            'votes': self.pending_votes,
            'proof': proof,
            'previous_hash': previous_hash
        }
        self.chain.append(block)
        votes_json = json.dumps(self.pending_votes)
        block_hash = self.hash(block)
        cursor.execute("""
            INSERT INTO blocks (index_no, timestamp, votes, proof, previous_hash, hash)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (block['index'], block['timestamp'], votes_json, proof, previous_hash, block_hash))
        db.commit()
        self.pending_votes = []
        return block

    def get_previous_block(self):
        return self.chain[-1]

    def proof_of_work(self, prev_proof):
        new_proof = 1
        while True:
            hash_op = hashlib.sha256(f'{new_proof**2 - prev_proof**2}'.encode()).hexdigest()
            if hash_op[:4] == '0000':
                return new_proof
            new_proof += 1

    def hash(self, block):
        return hashlib.sha256(json.dumps(block, sort_keys=True).encode()).hexdigest()

    def add_vote(self, voter_id, candidate):
        hashed_id = hashlib.sha256(voter_id.encode()).hexdigest()
        vote = {'voter_id': hashed_id, 'candidate': candidate}
        self.pending_votes.append(vote)
        contract.functions.storeVote(hashed_id, candidate).transact()
        cursor.execute("INSERT INTO votes (voter_hash, candidate) VALUES (%s, %s)", (hashed_id, candidate))
        db.commit()
        return vote

blockchain = Blockchain()

# Send OTP via email
def send_email_otp(receiver_email, otp):
    sender_email = "2020n10977@gmail.com"
    sender_password = "tbbg lrsr mlmr rxae"
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = "Your OTP Code"
    body = f"Your OTP is: {otp} (valid for 5 mins)"
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls()
        smtp.login(sender_email, sender_password)
        smtp.sendmail(sender_email, receiver_email, message.as_string())

# Route to send OTP
@app.route('/send-otp', methods=['POST'])
def send_otp():
    local_cursor = db.cursor(dictionary=True)
    data = request.get_json()
    email = data['email']
    otp = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=3)

    local_cursor.execute("REPLACE INTO otps (email, otp, expiry) VALUES (%s, %s, %s)", (email, otp, expiry))
    db.commit()
    send_email_otp(email, otp)
    local_cursor.close()
    return jsonify({"message": "OTP sent successfully!"})

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data['email']
    otp = data['otp']
    user_info = data.get('user_info')  # includes username, phone, cnic, role, secret_code, face_image (base64)

    # Fetch OTP and expiry from database
    cursor.execute("SELECT otp, expiry FROM otps WHERE email = %s", (email,))
    result = cursor.fetchone()

    if not result:
        print(f"[DEBUG] No OTP found for email: {email}")
        return jsonify({"message": "No OTP found for this email"}), 400

    db_otp = str(result['otp'])
    expiry_time = result['expiry']

    print(f"[DEBUG] OTP from DB: {db_otp}")
    print(f"[DEBUG] Expiry from DB: {expiry_time}")
    print(f"[DEBUG] User provided OTP: {otp}")
    print(f"[DEBUG] Current Time: {datetime.now()}")

    if db_otp != otp:
        return jsonify({"message": "Incorrect OTP"}), 400

    if datetime.now() > expiry_time:
        return jsonify({"message": "OTP has expired"}), 400

    role = user_info['role']

    # 🔐 Secret code check for 'official' role
    if role == 'official':
        secret_code = user_info.get('secret_code')
        if secret_code != 'momina.':
            print(f"[DEBUG] Invalid secret code provided for official role: {secret_code}")
            return jsonify({"message": "Invalid secret code for official role."}), 403
    elif role == 'admin':
        secret_code = user_info.get('secret_code')
        if secret_code != 'momina..':  # different code for admin
           print(f"[DEBUG] Invalid secret code for admin: {secret_code}")
           return jsonify({"message": "Invalid secret code for admin role."}), 403

    # 🧠 Face verification
    if 'face_image' not in user_info:
        print("[DEBUG] No face image provided in user_info.")
        return jsonify({"message": "Face image required"}), 400

    face_b64 = user_info['face_image'].split(',')[1]
    face_img = np.frombuffer(base64.b64decode(face_b64), dtype=np.uint8)
    frame = cv2.imdecode(face_img, cv2.IMREAD_COLOR)
    face_locations = face_recognition.face_locations(frame)

    if len(face_locations) != 1:
        print(f"[DEBUG] Face detection issue. Number of faces found: {len(face_locations)}")
        return jsonify({"message": "Face not detected or multiple faces detected"}), 400

    face_encoding = face_recognition.face_encodings(frame, face_locations)[0]
    face_encoding_b64 = base64.b64encode(face_encoding.tobytes()).decode('utf-8')

    # ❌ Check if email already registered for any role
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        if existing_user['role'] != role:
            print(f"[DEBUG] Email {email} already registered with role {existing_user['role']}")
            return jsonify({
                "message": f"Email is already registered for the {existing_user['role']} role. You cannot register with the {role} role."
            }), 409

    # ❌ Check if face already exists for any role
    cursor.execute("SELECT face_encoding, role FROM users WHERE face_encoding IS NOT NULL")
    existing_faces = cursor.fetchall()  # Ensure to fetch all results here
    for row in existing_faces:
        stored_encoding = np.frombuffer(base64.b64decode(row['face_encoding']), dtype=np.float64)
        if face_recognition.compare_faces([stored_encoding], face_encoding)[0]:
            if row['role'] != role:
                print(f"[DEBUG] Face already registered with role {row['role']}")
                return jsonify({
                    "message": f"Face already registered for the {row['role']} role. You cannot register with the {role} role."
                }), 409

    # ✅ Get next voting_id manually
    cursor.execute("SELECT MAX(voting_id) AS max_voting_id FROM users")
    voting_id_result = cursor.fetchone()
    next_voting_id = (voting_id_result['max_voting_id'] or 0) + 1

    print(f"[DEBUG] Assigning Voting ID: {next_voting_id}")

    # ✅ Insert user with voting_id
    cursor.execute(""" 
        INSERT INTO users (username, email, phone, cnic, role, is_verified, face_encoding, voting_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_info['username'], email, user_info['phone'], user_info['cnic'],
        role, True, face_encoding_b64, next_voting_id
    ))
    db.commit()

    print(f"[DEBUG] User {email} successfully registered with role {role}.")

    return jsonify({"message": "OTP verified and user registered with face!"})

import secrets

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        img_data = data['image'].split(',')[1]
        img = np.frombuffer(base64.b64decode(img_data), dtype=np.uint8)
        frame = cv2.imdecode(img, cv2.IMREAD_COLOR)

        face_locations = face_recognition.face_locations(frame)
        if len(face_locations) != 1:
            return jsonify({'success': False, 'msg': 'Face not detected or multiple faces detected'})

        encoding = face_recognition.face_encodings(frame, face_locations)[0]

        cursor.execute("SELECT voting_id, username, role, face_encoding FROM users WHERE face_encoding IS NOT NULL")
        for user in cursor.fetchall():
            stored_encoding = np.frombuffer(base64.b64decode(user['face_encoding']), dtype=np.float64)
            if face_recognition.compare_faces([stored_encoding], encoding)[0]:
                # ✅ Generate token
                token = secrets.token_hex(16)  # 32 characters random token
                created_at = datetime.now()
                expires_at = created_at + timedelta(minutes=5)

                # Save session in database
                cursor.execute("""
                    INSERT INTO sessions (voting_id, role, token, created_at, expires_at, ip_address)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user['voting_id'], user['role'], token, created_at, expires_at, request.remote_addr))
                db.commit()

                # 🔥 Correct the response: send token with key name 'token'
                return jsonify({
                    'success': True,
                    'voting_id': user['voting_id'],
                    'username': user['username'],
                    'role': user['role'],
                    'token': token  # 👈 not session_token, just token
                })

        return jsonify({'success': False, 'msg': 'Face not recognized'})

    except Exception as e:
        print(f"Error during login: {str(e)}")
        return jsonify({'success': False, 'msg': 'An error occurred during login'}), 400


    
@app.route('/cast-vote', methods=['POST'])
@require_valid_session  # Use the existing session validation decorator
def cast_vote():
    data = request.get_json()
    voting_id = str(data['voting_id'])
    candidate = data['candidate']
    image = data.get('image')  # base64 image from frontend
    timestamp = datetime.now()
    ip_address = request.remote_addr  # user's IP address

    # Step 0: Create initial pending log
    cursor.execute("""
        INSERT INTO vote_logs (voting_id, ip_address, candidate, timestamp, status)
        VALUES (%s, %s, %s, %s, %s)
    """, (voting_id, ip_address, candidate, timestamp, 'pending'))
    db.commit()

    try:
        # Step 1: Check if already voted by this voting_id
        voter_hash = hashlib.sha256(voting_id.encode()).hexdigest()
        cursor.execute("SELECT * FROM votes WHERE voter_hash = %s", (voter_hash,))
        existing_vote = cursor.fetchone()

        if existing_vote:
            # Update vote_logs to duplicate
            cursor.execute("""
                UPDATE vote_logs SET status=%s, reason=%s WHERE voting_id=%s
            """, ('duplicate', 'Duplicate voting attempt detected', voting_id))
            db.commit()
            return jsonify({"success": False, "status": "error", "message": "You have already cast your vote."})

        # Step 2: Face anti-duplication check (advanced)
        if image:
            img_data = image.split(',')[1]
            img = np.frombuffer(base64.b64decode(img_data), dtype=np.uint8)
            frame = cv2.imdecode(img, cv2.IMREAD_COLOR)
            face_locations = face_recognition.face_locations(frame)

            if len(face_locations) != 1:
                cursor.execute("""
                    UPDATE vote_logs SET status=%s, reason=%s WHERE voting_id=%s
                """, ('fraud_attempt', 'Face not detected or multiple faces detected', voting_id))
                db.commit()
                return jsonify({'success': False, 'status': 'error', 'message': 'Face not detected or multiple faces detected'})

            encoding = face_recognition.face_encodings(frame, face_locations)[0]

            cursor.execute("SELECT voting_id, face_encoding FROM users WHERE face_encoding IS NOT NULL")
            users = cursor.fetchall()
            for user in users:
                stored_encoding = np.frombuffer(base64.b64decode(user['face_encoding']), dtype=np.float64)
                matches = face_recognition.compare_faces([stored_encoding], encoding)
                if matches[0] and str(user['voting_id']) != voting_id:
                    cursor.execute("""
                        UPDATE vote_logs SET status=%s, reason=%s WHERE voting_id=%s
                    """, ('fraud_attempt', 'Suspicious face duplication detected', voting_id))
                    db.commit()
                    return jsonify({'success': False, 'status': 'error', 'message': 'Suspicious duplicate detected! Voting blocked.'})

        # Step 3: Passed all checks, cast the vote
        vote = blockchain.add_vote(voting_id, candidate)

        # Insert into votes table
        cursor.execute("""
            INSERT INTO votes (voter_hash, candidate, timestamp)
            VALUES (%s, %s, %s)
        """, (voter_hash, candidate, timestamp))
        db.commit()

        # Update vote_logs to success
        cursor.execute("""
            UPDATE vote_logs SET status=%s WHERE voting_id=%s
        """, ('success', voting_id))
        db.commit()

        return jsonify({"success": True, "status": "success", "vote": vote, "message": "Vote casted successfully."})

    except Exception as e:
        db.rollback()
        # Optional: update log if system error happens
        cursor.execute("""
            UPDATE vote_logs SET status=%s, reason=%s WHERE voting_id=%s
        """, ('error', str(e), voting_id))
        db.commit()
        return jsonify({'success': False, 'status': 'error', 'message': 'An error occurred.', 'error': str(e)})

@app.route('/view-logs', methods=['GET'])
@require_valid_session
def view_logs():
    role = request.args.get('role')

    if role != 'official':
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403

    try:
        cursor.execute("""
            SELECT id, voting_id, ip_address, candidate, timestamp, status, reason
            FROM vote_logs
            ORDER BY timestamp DESC
        """)
        logs = cursor.fetchall()
        return jsonify({'success': True, 'logs': logs})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Failed to fetch vote logs'})

@app.route('/get-votes', methods=['GET'])
@require_valid_session
def get_votes():
    role = request.args.get('role')

    if role != 'official':
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403

    try:
        cursor.execute("""
            SELECT candidate, COUNT(*) as vote_count
            FROM votes
            GROUP BY candidate
        """)
        results = cursor.fetchall()

        # Format: {'Imran Khan': 120, 'Nawaz Sharif': 95, ...}
        vote_counts = {row['candidate']: row['vote_count'] for row in results}

        return jsonify({'success': True, 'votes': vote_counts})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Failed to fetch vote counts'})



@app.route('/validate-chain', methods=['GET'])
@require_valid_session
def validate_chain():
    chain = blockchain.chain
    for i in range(1, len(chain)):
        current_block = chain[i]
        previous_block = chain[i-1]

        # Check if previous hash is correct
        if current_block['previous_hash'] != blockchain.hash(previous_block):
            return jsonify({'valid': False, 'message': 'Blockchain broken at block ' + str(current_block['index'])})

        # Check proof of work
        prev_proof = previous_block['proof']
        proof = current_block['proof']
        hash_op = hashlib.sha256(f'{proof**2 - prev_proof**2}'.encode()).hexdigest()
        if hash_op[:4] != '0000':
            return jsonify({'valid': False, 'message': 'Invalid proof of work at block ' + str(current_block['index'])})

    return jsonify({'valid': True, 'message': 'Blockchain is valid.'})

def send_reply_email(user_name, user_email, subject, message):
    # Replace with your email credentials
    sender_email = "2020n10977@gmail.com"
    sender_password = "tbbg lrsr mlmr rxae"
    
    message_body = f"Hello {user_name},\n\nThank you for reaching out!\n\nSubject: {subject}\nMessage: {message}\n\nWe will get back to you soon."

    # Create the email content
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = user_email
    message["Subject"] = "Thank You for Contacting Us!"

    message.attach(MIMEText(message_body, "plain"))

    try:
        # Send email using SMTP
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.sendmail(sender_email, user_email, message.as_string())
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

@app.route('/contact', methods=['POST'])
@require_valid_session
def contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    voting_id = data.get('voting_id')

    # Validate session voting_id matches (optional but recommended)
    if str(g.session['voting_id']) != str(voting_id):
        return jsonify({"message": "Voting ID mismatch"}), 403

    try:
        insert_query = """
            INSERT INTO contact_messages (name, email, subject, message, voting_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (name, email, subject, message, voting_id))
        db.commit()
    except Exception as e:
        print(f"DB insert error: {str(e)}")
        return jsonify({"message": "Failed to save message in database."}), 500

    if send_reply_email(name, email, subject, message):
        return jsonify({"message": "Your message has been received. We'll respond shortly."}), 200
    else:
        return jsonify({"message": "Message saved, but failed to send confirmation email."}), 500

@app.route("/api/admin/vote-stats", methods=["GET"])
@require_valid_session
def vote_stats():
    cursor.execute("SELECT candidate, COUNT(*) as votes FROM votes GROUP BY candidate")
    return jsonify(cursor.fetchall())

@app.route("/api/admin/add-official", methods=["POST"])
@require_valid_session
def add_official():
    data = request.json
    try:
        cursor.execute(
            "INSERT INTO users (username, email, phone, cnic, role, is_verified) VALUES (%s, %s, %s, %s, 'official', 1)",
            (data["username"], data["email"], data["phone"], data["cnic"])
        )
        db.commit()
        return jsonify({"status": "success"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
@app.route('/api/admin/update-official', methods=['PUT'])
def update_official():
    data = request.json
    official_id = data.get("id")
    username = data.get("username")
    email = data.get("email")
    phone = data.get("phone")
    cnic = data.get("cnic")

    try:
        cursor.execute("""
            UPDATE users 
            SET username = %s, email = %s, phone = %s, cnic = %s 
            WHERE id = %s AND role = 'official'
        """, (username, email, phone, cnic, official_id))
        db.commit()
        return jsonify({"status": "success"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
@app.route('/api/admin/delete-official', methods=['DELETE'])
def delete_official():
    data = request.json
    official_id = data.get("id")

    try:
        cursor.execute("DELETE FROM users WHERE id = %s AND role = 'official'", (official_id,))
        db.commit()
        return jsonify({"status": "success"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route("/api/admin/officials", methods=["GET"])
@require_valid_session
def get_officials():
    cursor.execute("SELECT id, username, email, phone, cnic FROM users WHERE role = 'official'")
    return jsonify(cursor.fetchall())


if __name__ == "__main__":
    app.run(debug=True)
