const MedicalPrescription = artifacts.require("MedicalPrescription");

module.exports = function(deployer, network, accounts) {
  // Set the regulatory authority to the first account in Ganache
  const regulatoryAuthority = accounts[0];

  // Deploy the contract with the regulatoryAuthority address
  deployer.deploy(MedicalPrescription, regulatoryAuthority);
};
