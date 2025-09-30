
const contractABI = [
  "function registerBatch(string,uint256,uint256,string)",
  "function getBatch(uint256) view returns (uint256,string,uint256,uint256,address,address,bool,string)",
  "function nextBatchId() view returns (uint256)",
  "function owner() view returns (address)",
  "function isInspector(address) view returns (bool)",
  "function addInspector(address)",
  "function verifyBatch(uint256)",
  "event BatchRegistered(uint256,address)",
  "event BatchVerified(uint256,address)"
];


const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let provider, signer, contract;

function setStatus(text) {
  const el = document.getElementById("walletAddress");
  if (el) el.innerText = text;
  console.log(text);
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found!");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // triggers popup if needed
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    const addr = await signer.getAddress();


    let role = "Farmer";
    try {
      const owner = await contract.owner();
      const isInspector = await contract.isInspector(addr);
      if (addr.toLowerCase() === owner.toLowerCase()) role = "Owner";
      else if (isInspector) role = "Inspector";
    } catch { }

    document.getElementById("walletAddress").innerText = `Connected: ${addr} (${role})`;
    console.log("✅ Connected:", addr, "Role:", role);

  } catch (err) {
    console.error("Connect failed:", err);
    alert("❌ Connect failed — see console for details");
  }
}



async function handleRegister(e) {
  e.preventDefault();
  if (!contract) { alert("Connect wallet first"); return; }

  const crop = document.getElementById("crop").value.trim();
  const quantity = Number(document.getElementById("quantity").value);
  const ipfsHash = document.getElementById("ipfsHash").value.trim();
  const harvestDate = Math.floor(Date.now() / 1000);

  if (!crop || !quantity || !ipfsHash) { alert("Fill all fields"); return; }

  try {
    const tx = await contract.registerBatch(crop, quantity, harvestDate, ipfsHash, { gasLimit: 300000 });
    setStatus("Sent tx, waiting for confirmation...");
    await tx.wait();
    setStatus("✅ Batch registered on-chain");
  } catch (err) {
    console.error("register error:", err);
    alert("Register failed — check console.");
  }
}


async function handleAddInspector() {
  if (!contract) { alert("Connect wallet first"); return; }
  const addr = document.getElementById("inspectorAddr").value.trim();
  if (!addr) { alert("Enter address"); return; }
  try {
    const tx = await contract.addInspector(addr);
    await tx.wait();
    setStatus("Inspector added.");
  } catch (err) {
    console.error("addInspector:", err);
    alert("Add inspector failed (check console).");
  }
}


async function handleVerify() {
  if (!contract) { alert("Connect wallet first"); return; }
  const idRaw = document.getElementById("verifyBatchId").value;
  if (!idRaw) { alert("Enter batch ID"); return; }
  const id = parseInt(idRaw);
  try {
    const tx = await contract.verifyBatch(id, { gasLimit: 200000 });
    await tx.wait();
    setStatus("Batch verified on-chain.");
  } catch (err) {
    console.error("verify error:", err);
    alert("Verify failed (check console).");
  }
}


async function handleGetBatch() {
  if (!contract) { alert("Connect wallet first"); return; }
  const idRaw = document.getElementById("batchId").value;
  if (!idRaw) { alert("Enter batch ID"); return; }
  const id = parseInt(idRaw);
  try {
    const batch = await contract.getBatch(id);
    const out = {
      id: batch[0].toString(),
      crop: batch[1],
      quantity: batch[2].toString(),
      harvestDateUnix: batch[3].toString(),
      harvestDate: new Date(Number(batch[3].toString()) * 1000).toLocaleString(),
      farmer: batch[4],
      inspector: batch[5],
      verified: batch[6],
      ipfsHash: batch[7]
    };
    document.getElementById("batchOutput").innerText = JSON.stringify(out, null, 2);
  } catch (err) {
    console.error("getBatch err:", err);
    alert("Fetch failed (check console).");
  }
}


window.addEventListener("load", async () => {
  if (window.ethereum) {
    try {
      // Ask accounts immediately
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await connectWallet();
    } catch (err) {
      console.error("Auto-connect failed:", err);
      document.getElementById("walletAddress").innerText =
        "MetaMask detected (not connected)";
    }
  } else {
    document.getElementById("walletAddress").innerText =
      "MetaMask not detected";
  }
});


document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  console.log("UI: registerForm submit");
  await handleRegister(e);
});


document.getElementById("addInspectorBtn")?.addEventListener("click", async (e) => {
  console.log("UI: addInspector click");
  await handleAddInspector();
});


document.getElementById("verifyBtn")?.addEventListener("click", async (e) => {
  console.log("UI: verify click");
  await handleVerify();
});


document.getElementById("getBatchBtn")?.addEventListener("click", async (e) => {
  console.log("UI: getBatch click");
  await handleGetBatch();
});


window.__sc_debug = {
  contractAddress,
  showState: async () => {
    try {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await p.listAccounts();
      console.log("accounts:", accounts);
      const net = await p.getNetwork();
      console.log("network:", net);
      if (typeof contract !== "undefined") {
        console.log("contract functions:", Object.keys(contract.interface.functions));
        try {
          console.log("nextBatchId:", (await contract.nextBatchId()).toString());
        } catch (e) { console.log("nextBatchId read failed:", e.message || e); }
      } else {
        console.log("contract not defined");
      }
    } catch (e) {
      console.error("showState err:", e);
    }
  }
};
