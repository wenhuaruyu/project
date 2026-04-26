const ENV_PROFILE = Object.freeze({
  DEV: "dev",
  PROD: "prod"
})

function resolveFunctionEnv(cloudEnvId) {
  if (typeof cloudEnvId !== "string" || cloudEnvId.trim() === "") {
    throw new Error("cloudEnvId is required.")
  }

  const normalized = cloudEnvId.toLowerCase()
  if (normalized.endsWith("-dev")) {
    return ENV_PROFILE.DEV
  }
  if (normalized.endsWith("-prod")) {
    return ENV_PROFILE.PROD
  }

  throw new Error("Unsupported cloudEnvId suffix. Use '-dev' or '-prod'.")
}

module.exports = {
  ENV_PROFILE,
  resolveFunctionEnv
}
