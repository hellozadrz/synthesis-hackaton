// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentMarketplace
 * @notice P2P marketplace for AI agents to exchange crypto trustlessly.
 * Agents post offers, counterparties match them, escrow enforces settlement.
 */
contract AgentMarketplace is ReentrancyGuard {

    enum Status { Open, Settled, Cancelled }

    struct Offer {
        address agent;
        address sellToken;
        address buyToken;
        uint256 sellAmount;
        uint256 buyAmount;
        address counterparty;
        Status status;
        uint256 expiresAt;
    }

    mapping(uint256 => Offer) public offers;
    uint256 public offerCount;
    mapping(address => uint256) public reputation;

    event OfferCreated(uint256 indexed id, address indexed agent, address sellToken, address buyToken, uint256 sellAmount, uint256 buyAmount);
    event OfferSettled(uint256 indexed id, address indexed counterparty);
    event OfferCancelled(uint256 indexed id);

    function createOffer(address sellToken, address buyToken, uint256 sellAmount, uint256 buyAmount, uint256 duration) external nonReentrant returns (uint256 id) {
        require(sellAmount > 0 && buyAmount > 0 && sellToken != buyToken, "Invalid params");
        IERC20(sellToken).transferFrom(msg.sender, address(this), sellAmount);
        id = ++offerCount;
        offers[id] = Offer(msg.sender, sellToken, buyToken, sellAmount, buyAmount, address(0), Status.Open, block.timestamp + duration);
        emit OfferCreated(id, msg.sender, sellToken, buyToken, sellAmount, buyAmount);
    }

    function matchOffer(uint256 id) external nonReentrant {
        Offer storage o = offers[id];
        require(o.status == Status.Open && block.timestamp < o.expiresAt && msg.sender != o.agent, "Cannot match");
        o.status = Status.Settled;
        o.counterparty = msg.sender;
        IERC20(o.buyToken).transferFrom(msg.sender, o.agent, o.buyAmount);
        IERC20(o.sellToken).transfer(msg.sender, o.sellAmount);
        reputation[o.agent]++;
        reputation[msg.sender]++;
        emit OfferSettled(id, msg.sender);
    }

    function cancelOffer(uint256 id) external nonReentrant {
        Offer storage o = offers[id];
        require(o.agent == msg.sender && o.status == Status.Open, "Cannot cancel");
        o.status = Status.Cancelled;
        IERC20(o.sellToken).transfer(msg.sender, o.sellAmount);
        emit OfferCancelled(id);
    }

    function getOpenOffers(uint256 from, uint256 limit) external view returns (uint256[] memory ids) {
        uint256 count;
        uint256[] memory temp = new uint256[](limit);
        for (uint256 i = from; i <= offerCount && count < limit; i++) {
            if (offers[i].status == Status.Open && block.timestamp < offers[i].expiresAt) temp[count++] = i;
        }
        ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) ids[i] = temp[i];
    }
}
