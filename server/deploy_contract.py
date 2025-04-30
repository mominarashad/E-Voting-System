from web3 import Web3 
import json

# Connect to Ganache
ganache_url = "http://127.0.0.1:7545"  # default Ganache RPC
web3 = Web3(Web3.HTTPProvider(ganache_url))

# Set default account (the first one from Ganache)
web3.eth.default_account = web3.eth.accounts[0]

# Load the compiled contract JSON
with open("compiled_code.json") as file:
    compiled_code = json.load(file)

# Access the correct contract name and ABI
abi = compiled_code['contracts']['VotingContract.sol']['VoteContract']['abi']
bytecode = compiled_code['contracts']['VotingContract.sol']['VoteContract']['evm']['bytecode']['object']

# Create contract in Python
VoteContract = web3.eth.contract(abi=abi, bytecode=bytecode)

# Deploy contract
tx_hash = VoteContract.constructor().transact()
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

# Get deployed contract address
contract_address = tx_receipt.contractAddress

# Save address and ABI to file for future use
with open("contract_info.json", "w") as file:
    json.dump({
        "address": contract_address,
        "abi": abi
    }, file)

print("Contract deployed at:", contract_address)
