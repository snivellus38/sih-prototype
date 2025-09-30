async function main() {
  const address = require("../deployments.json").supplyChain;
  const [, inspector] = await ethers.getSigners();
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const sc = SupplyChain.attach(address);
  const batchId = parseInt(process.argv[2] || "0");
  console.log("Verifying batch", batchId, "as", inspector.address);
  const tx = await sc.connect(inspector).verifyBatch(batchId);
  await tx.wait();
  console.log("Batch verified.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
