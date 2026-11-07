// backend/test-runner.js
const API_URL = "http://localhost:3000/check-scope";

const testCases = [
  {
    name: "Test 1: Clear Out of Scope (Database)",
    contract: "Build a static frontend landing page using HTML and CSS.",
    message: "Can you wire up a PostgreSQL database and user authentication?",
    expected_in_scope: false
  },
  {
    name: "Test 2: Clear In Scope (Color change)",
    contract: "Build a static frontend landing page using HTML and CSS.",
    message: "Can you change the header background to blue instead of red?",
    expected_in_scope: true
  },
  {
    name: "Test 3: Vague Scope Creep (Graphic Design)",
    contract: "Develop a React dashboard interface based on provided Figma files.",
    message: "I didn't like the logo in the Figma file, can you design a 3D animated one for the navbar?",
    expected_in_scope: false
  },
  {
    name: "Test 4: In Scope Bug Fix",
    contract: "Develop a React dashboard interface based on provided Figma files.",
    message: "The login button on the dashboard is overlapping with the text on mobile screens.",
    expected_in_scope: true
  }
];

async function runTests() {
  console.log("\n🚀 Starting ScopeGuard AI Test Runner...\n");
  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    process.stdout.write(`⏳ Running ${tc.name}... `);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract: tc.contract, message: tc.message })
      });
      
      const data = await res.json();

      if (data.in_scope === tc.expected_in_scope) {
        console.log(`✅ PASS`);
        passed++;
      } else {
        console.log(`❌ FAIL`);
        console.log(`   Expected in_scope: ${tc.expected_in_scope}, Got: ${data.in_scope}`);
        console.log(`   AI Reason: ${data.reason}`);
        console.log(`   Full AI Dump:`, data);
      }
    } catch (err) {
      console.log(`\n❌ ERROR: Could not connect to API. Is 'node server.js' running?`);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎯 Test Run Complete: ${passed}/${testCases.length} Passed`);
  if (passed === testCases.length) {
    console.log("🏆 100% Accuracy! Ready for Devpost Submission.\n");
  }
}

runTests();