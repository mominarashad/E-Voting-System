# E-Voting System with Blockchain and Face Verification

This is a secure and tamper-proof E-Voting System built using **Flask** for the backend, **MySQL** for database management, **Ethereum** (via Ganache) for distributed ledger-based vote storage, and **face recognition** for voter authentication.

## Tech Stack

- **Frontend:**
  - React+vite
  
  - HTML, CSS
  
- **Backend:**
  - Flask (Python)
  - MySQL (Database)
  - Web3.py (Ethereum Integration)
  - OpenCV (Face Recognition)

- **Blockchain:**
  - Ethereum (Ganache for local blockchain)

- **Authentication:**
  - OTP Authentication
  - Face Recognition for login and registration

## Features

- **Role-based Access Control (RBAC):** Different roles for voters, officials, and admin.
- **OTP Authentication:** Users receive an OTP for verification during registration.
- **Face Verification:** Captures and verifies faces for added security during login and registration.
- **Ethereum Integration:** Votes are stored on an Ethereum blockchain (using Ganache) for transparency and tamper-proof record keeping.
- **Secure Voting:** Once a user logs in (via OTP and face recognition), they can cast votes, which are stored in MySQL and on the Ethereum blockchain.

## Dependencies

### Frontend (React):
```bash
npm install

```
#### Backend (Flask):

To install the backend dependencies, ensure you have Python 3.12+ installed and follow these steps:

1. **Clone the repository** and navigate to the `server` folder:
   ```bash
   pip install -r requirements.txt
   ```
####Running Ganache (Ethereum Blockchain)
Download Ganache from the Truffle Suite website.

Launch Ganache and ensure the Ethereum network is running on http://127.0.0.1:7545.

Deploy the Ethereum smart contracts from the smart_contracts/ folder or use the provided deployment script.

Running the Flask App

###Start the backend
```bash
   python Momina.py
   ```

###Start the frontend 
```bash
   npm run dev
   ```
