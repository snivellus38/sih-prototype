async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.deployed();
  console.log("✅ SupplyChain deployed to:", supplyChain.address);
  require('fs').writeFileSync("deployments.json", JSON.stringify({ supplyChain: supplyChain.address }, null, 2));
}
main().catch(e=>{console.error(e); process.exitCode=1});
