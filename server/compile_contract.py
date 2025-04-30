from solcx import compile_standard, install_solc
import json

install_solc('0.8.0')

with open("VotingContract.sol", "r") as file:
    contract_code = file.read()

compiled_sol = compile_standard({
    "language": "Solidity",
    "sources": {
        "VotingContract.sol": {
            "content": contract_code
        }
    },
    "settings": {
        "outputSelection": {
            "*": {
                "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
            }
        }
    }
}, solc_version="0.8.0")

with open("compiled_code.json", "w") as f:
    json.dump(compiled_sol, f)
