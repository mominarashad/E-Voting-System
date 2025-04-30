// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VoteContract {
    struct Vote {
        string voterIdHash;
        string candidate;
    }

    Vote[] public votes;

    function storeVote(string memory _voterIdHash, string memory _candidate) public {
        votes.push(Vote(_voterIdHash, _candidate));
    }

    function getVote(uint index) public view returns (string memory, string memory) {
        return (votes[index].voterIdHash, votes[index].candidate);
    }

    function totalVotes() public view returns (uint) {
        return votes.length;
    }
}
