async function main() {
  const address = require("../deployments.json").supplyChain;
  const [farmer] = await ethers.getSigners();
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const sc = SupplyChain.attach(address);
  const crop = process.argv[2] || "Tomato";
  const quantity = parseInt(process.argv[3] || "100");
  const harvestDate = parseInt(process.argv[4] || Math.floor(Date.now()/1000).toString());
  const ipfs = process.argv[5] || "QmFakeCidForDemo";
  console.log("Registering batch as", farmer.address);
  const tx = await sc.connect(farmer).registerBatch(crop, quantity, harvestDate, ipfs);
  await tx.wait();
  console.log("Batch registered.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
