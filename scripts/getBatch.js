async function main() {
  const address = require("../deployments.json").supplyChain;
  const batchId = parseInt(process.argv[2] || "0");
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const sc = SupplyChain.attach(address);
  const b = await sc.getBatch(batchId);
  console.log({
    id: b[0].toString(),
    crop: b[1],
    quantity: b[2].toString(),
    harvestDate: b[3].toString(),
    farmer: b[4],
    inspector: b[5],
    verified: b[6],
    ipfsHash: b[7],
  });
}
main().catch(e=>{console.error(e);process.exitCode=1});
