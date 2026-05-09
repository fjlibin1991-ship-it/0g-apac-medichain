// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HealthWorkerRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address ownerAddress = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        HealthWorkerRegistry registry = new HealthWorkerRegistry();
        registry.initialize(ownerAddress);

        vm.stopBroadcast();

        console.log("HealthWorkerRegistry deployed at:", address(registry));
        console.log("Owner:", ownerAddress);
    }
}