// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title HealthWorkerRegistry
 * @notice Registry for community health workers with 0G Agent ID integration
 * @dev Stores health worker credentials on-chain for verification by the 0G network
 */
contract HealthWorkerRegistry is Ownable, ReentrancyGuard, Initializable {
    // Health worker status enum
    enum WorkerStatus {
        None,
        Registered,
        Active,
        Suspended,
        Revoked
    }

    // Health worker profile structure
    struct HealthWorker {
        uint256 workerId;
        address walletAddress;
        bytes32 agentId;          // 0G Agent ID hash
        string metadataHash;      // IPFS/0G Storage hash for additional metadata
        uint256 regionCode;       // Geographic region identifier
        uint256 registrationTime;
        uint256 lastActiveTime;
        WorkerStatus status;
        string[] credentials;     // List of credential hashes/certs
    }

    // Mapping from wallet address to worker profile
    mapping(address => HealthWorker) public workers;

    // Mapping from agent ID to wallet address
    mapping(bytes32 => address) public agentIdToWallet;

    // Mapping from region to worker count
    mapping(uint256 => uint256) public regionWorkerCount;

    // Array of all registered worker addresses
    address[] public allWorkers;

    // Events
    event WorkerRegistered(
        address indexed wallet,
        bytes32 indexed agentId,
        uint256 regionCode,
        uint256 timestamp
    );

    event WorkerStatusChanged(
        address indexed wallet,
        WorkerStatus previousStatus,
        WorkerStatus newStatus,
        uint256 timestamp
    );

    event WorkerUpdated(
        address indexed wallet,
        bytes32 indexed agentId,
        uint256 timestamp
    );

    event CredentialAdded(
        address indexed wallet,
        string credentialHash,
        uint256 timestamp
    );

    // Custom errors
    error WorkerAlreadyRegistered(address wallet);
    error WorkerNotFound(address wallet);
    error InvalidAgentId(bytes32 agentId);
    error InvalidStatus(WorkerStatus current, WorkerStatus required);
    error UnauthorizedCaller();
    error ZeroAddress();
    error DuplicateAgentId(bytes32 agentId);

    // Modifiers
    modifier onlyRegisteredWorker() {
        if (workers[msg.sender].status != WorkerStatus.Active) {
            revert WorkerNotFound(msg.sender);
        }
        _;
    }

    modifier onlyValidStatus(WorkerStatus _status) {
        if (_status == WorkerStatus.None) {
            revert InvalidStatus(WorkerStatus.None, WorkerStatus.Registered);
        }
        _;
    }

    /**
     * @notice Initialize the contract
     * @param initialOwner The initial owner of the contract
     */
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    /**
     * @notice Register a new health worker
     * @param _agentId The 0G Agent ID hash
     * @param _metadataHash IPFS/0G Storage hash for metadata
     * @param _regionCode Geographic region code
     * @param _credentials Initial credential hashes
     * @return workerId The assigned worker ID
     */
    function registerWorker(
        bytes32 _agentId,
        string calldata _metadataHash,
        uint256 _regionCode,
        string[] calldata _credentials
    ) external nonReentrant onlyValidStatus(WorkerStatus.Registered) returns (uint256 workerId) {
        if (workers[msg.sender].status != WorkerStatus.None) {
            revert WorkerAlreadyRegistered(msg.sender);
        }
        if (_agentId == bytes32(0)) {
            revert InvalidAgentId(_agentId);
        }
        if (agentIdToWallet[_agentId] != address(0)) {
            revert DuplicateAgentId(_agentId);
        }

        workerId = allWorkers.length + 1;

        HealthWorker storage worker = workers[msg.sender];
        worker.workerId = workerId;
        worker.walletAddress = msg.sender;
        worker.agentId = _agentId;
        worker.metadataHash = _metadataHash;
        worker.regionCode = _regionCode;
        worker.registrationTime = block.timestamp;
        worker.lastActiveTime = block.timestamp;
        worker.status = WorkerStatus.Registered;

        // Copy credentials
        for (uint256 i = 0; i < _credentials.length; i++) {
            worker.credentials.push(_credentials[i]);
        }

        agentIdToWallet[_agentId] = msg.sender;
        allWorkers.push(msg.sender);
        regionWorkerCount[_regionCode]++;

        emit WorkerRegistered(msg.sender, _agentId, _regionCode, block.timestamp);

        return workerId;
    }

    /**
     * @notice Activate a registered worker (requires owner or oracle verification)
     * @param _wallet The worker's wallet address
     */
    function activateWorker(address _wallet) external onlyOwner {
        HealthWorker storage worker = workers[_wallet];
        if (worker.status == WorkerStatus.None) {
            revert WorkerNotFound(_wallet);
        }
        if (worker.status != WorkerStatus.Registered) {
            revert InvalidStatus(worker.status, WorkerStatus.Registered);
        }

        WorkerStatus previousStatus = worker.status;
        worker.status = WorkerStatus.Active;
        worker.lastActiveTime = block.timestamp;

        emit WorkerStatusChanged(_wallet, previousStatus, WorkerStatus.Active, block.timestamp);
    }

    /**
     * @notice Suspend a worker (temporary)
     * @param _wallet The worker's wallet address
     */
    function suspendWorker(address _wallet) external onlyOwner {
        HealthWorker storage worker = workers[_wallet];
        if (worker.status != WorkerStatus.Active) {
            revert InvalidStatus(worker.status, WorkerStatus.Active);
        }

        WorkerStatus previousStatus = worker.status;
        worker.status = WorkerStatus.Suspended;

        emit WorkerStatusChanged(_wallet, previousStatus, WorkerStatus.Suspended, block.timestamp);
    }

    /**
     * @notice Revoke a worker permanently
     * @param _wallet The worker's wallet address
     */
    function revokeWorker(address _wallet) external onlyOwner {
        HealthWorker storage worker = workers[_wallet];
        if (worker.status == WorkerStatus.None || worker.status == WorkerStatus.Revoked) {
            revert WorkerNotFound(_wallet);
        }

        WorkerStatus previousStatus = worker.status;
        worker.status = WorkerStatus.Revoked;
        regionWorkerCount[worker.regionCode]--;

        emit WorkerStatusChanged(_wallet, previousStatus, WorkerStatus.Revoked, block.timestamp);
    }

    /**
     * @notice Update worker metadata
     * @param _metadataHash New metadata hash
     */
    function updateMetadata(string calldata _metadataHash) external onlyRegisteredWorker {
        HealthWorker storage worker = workers[msg.sender];
        worker.metadataHash = _metadataHash;
        worker.lastActiveTime = block.timestamp;

        emit WorkerUpdated(msg.sender, worker.agentId, block.timestamp);
    }

    /**
     * @notice Add a credential to the caller's profile
     * @param _credentialHash Hash of the credential document
     */
    function addCredential(string calldata _credentialHash) external onlyRegisteredWorker {
        HealthWorker storage worker = workers[msg.sender];
        worker.credentials.push(_credentialHash);
        worker.lastActiveTime = block.timestamp;

        emit CredentialAdded(msg.sender, _credentialHash, block.timestamp);
    }

    /**
     * @notice Verify a worker's credentials by wallet address
     * @param _wallet The worker's wallet address
     * @return isValid Whether the worker is active and verified
     */
    function verifyWorker(address _wallet) external view returns (bool isValid) {
        HealthWorker memory worker = workers[_wallet];
        return worker.status == WorkerStatus.Active;
    }

    /**
     * @notice Verify a worker by agent ID
     * @param _agentId The 0G Agent ID hash
     * @return isValid Whether the worker is active and verified
     */
    function verifyWorkerByAgentId(bytes32 _agentId) external view returns (bool isValid) {
        address wallet = agentIdToWallet[_agentId];
        if (wallet == address(0)) {
            return false;
        }
        HealthWorker memory worker = workers[wallet];
        return worker.status == WorkerStatus.Active;
    }

    /**
     * @notice Get worker details by wallet address
     * @param _wallet The worker's wallet address
     * @return worker The worker profile
     */
    function getWorker(address _wallet) external view returns (HealthWorker memory worker) {
        return workers[_wallet];
    }

    /**
     * @notice Get worker details by agent ID
     * @param _agentId The 0G Agent ID hash
     * @return worker The worker profile
     */
    function getWorkerByAgentId(bytes32 _agentId) external view returns (HealthWorker memory worker) {
        address wallet = agentIdToWallet[_agentId];
        if (wallet == address(0)) {
            revert WorkerNotFound(address(0));
        }
        return workers[wallet];
    }

    /**
     * @notice Get all registered workers count
     * @return count Total number of registered workers
     */
    function getTotalWorkers() external view returns (uint256 count) {
        return allWorkers.length;
    }

    /**
     * @notice Get workers by region
     * @param _regionCode The region code to query
     * @return workerAddresses Array of worker addresses in the region
     */
    function getWorkersByRegion(uint256 _regionCode) external view returns (address[] memory workerAddresses) {
        uint256 count = regionWorkerCount[_regionCode];
        workerAddresses = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allWorkers.length; i++) {
            if (workers[allWorkers[i]].regionCode == _regionCode && 
                workers[allWorkers[i]].status == WorkerStatus.Active) {
                workerAddresses[index] = allWorkers[i];
                index++;
            }
        }
        
        return workerAddresses;
    }

    /**
     * @notice Update last active timestamp (called by worker)
     */
    function updateLastActive() external onlyRegisteredWorker {
        workers[msg.sender].lastActiveTime = block.timestamp;
    }

    /**
     * @notice Get worker status
     * @param _wallet The worker's wallet address
     * @return status The current status of the worker
     */
    function getWorkerStatus(address _wallet) external view returns (WorkerStatus status) {
        return workers[_wallet].status;
    }
}
