const { spawnSync } = require("child_process")

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false })
  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

console.log("[Precheck] 1/2 执行核心流程与权限/支付口径验证")
run("node", ["scripts/verify-all-steps.js"])

console.log("[Precheck] 2/2 执行索引计划与字段命名验证")
run("node", ["scripts/verify-index-plan.js"])

console.log("发布前验收脚本执行完成：通过")
