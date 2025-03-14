pragma solidity ^0.5.0;

contract MedicalPrescription {
    uint public prescriptionCount = 0;
    address public regulatoryAuthority;

    struct Prescription {
        uint id;
        address doctor;
        uint16 patientId;
        string drug;
        uint dosage;
        uint quantity;
        bool fulfilled; 
        bool emergency;
        string justification;
        bool flagged;
    }

    // Private mapping for safe dosage limits
    mapping(string => uint) private safeLimits; 

    // Mapping to store prescriptions by their ID
    mapping(uint => Prescription) public prescriptions;

    event PrescriptionFulfilled(uint id);
    event PrescriptionFlagged(uint id, string reason);
    event PrescriptionResolved(uint id, string resolution);
    event PrescriptionCreated(uint id, address doctor, uint16 patientId, string drug, uint dosage, uint quantity, bool emergency, string justification, bool flagged);

    constructor(address _regulatoryAuthority) public {
        regulatoryAuthority = _regulatoryAuthority;
    }

    function setSafeLimit(string memory _drug, uint _limit) public {
        require(msg.sender == regulatoryAuthority, "Only regulatory authority can set safe limits.");
        safeLimits[_drug] = _limit;
    }

    // Getter function for safe limits
    function getSafeLimit(string memory _drug) public view returns (uint) {
        uint safeLimit = safeLimits[_drug];
        require(safeLimit > 0, "Safe limit for drug not set");
        return safeLimits[_drug];
    }

    function createPrescription(
        uint16 _patientId,
        string memory _drug,
        uint _dosage,
        uint _quantity,
        bool _emergency,
        string memory _justification
    ) public {
        prescriptionCount++;

        bool flagged = false;

        uint safeLimit = safeLimits[_drug];
        require(safeLimit > 0, "Safe limit for this drug is not set.");

        if (_emergency) {
            // check for inconsistencies in emergency flagging
            require(_dosage > safeLimit, "Dosage is safe, no emergency flagging required");

            // Flag if emergency prescription exceeds safe limits
            if (safeLimit > 0 && _dosage > safeLimit) {
                flagged = true;
                emit PrescriptionFlagged(prescriptionCount, "Emergency prescription exceeds safe limit.");
            }
        } else {
            require(_dosage <= safeLimit, "Dosage exceeds safe limit.");
        }

        prescriptions[prescriptionCount] = Prescription(
            prescriptionCount,
            msg.sender,  // doctor address
            _patientId,
            _drug,
            _dosage,
            _quantity,
            false,
            _emergency,
            _justification,
            flagged
        );

        // Emit the PrescriptionCreated event
        emit PrescriptionCreated(
            prescriptionCount,
            msg.sender,  // doctor address
            _patientId,
            _drug,
            _dosage,
            _quantity,
            _emergency,
            _justification,
            flagged
        );
    }

    function fulfillPrescription(uint _id) public {
        Prescription storage prescription = prescriptions[_id];
        require(!prescription.fulfilled, "Prescription already fulfilled.");
        prescription.fulfilled = true; // Simply mark it as fulfilled
        emit PrescriptionFulfilled(_id);
    }

    // Flag prescription, any user can flag it.
    function flagPrescription(uint _id, string memory _reason) public {
        Prescription storage prescription = prescriptions[_id];
        prescription.flagged = true;
        emit PrescriptionFlagged(_id, _reason);
    }

    // Only regulatory authority can resolve flagged prescriptions
    function resolveFlaggedPrescription(uint _id, string memory _resolution) public {
        require(msg.sender == regulatoryAuthority, "Only regulatory authority can resolve flagged prescriptions.");
        Prescription storage prescription = prescriptions[_id];
        require(prescription.flagged, "Prescription is not flagged.");
        prescription.flagged = false;
        emit PrescriptionResolved(_id, _resolution);
    }

    // Corrected return type to match the expected tuple
    function viewPrescription(uint _id) public view returns (
        uint, address, uint16, string memory, uint, uint, string memory, bool, bool, bool
    ) {
        Prescription memory prescription = prescriptions[_id];
        return (
            prescription.id,
            prescription.doctor,
            prescription.patientId,
            prescription.drug,
            prescription.dosage,
            prescription.quantity,
            prescription.justification,
            prescription.fulfilled,
            prescription.emergency,
            prescription.flagged
        );
    }
}
