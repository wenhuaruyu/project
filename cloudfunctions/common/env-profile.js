const ENV_PROFILE = Object.freeze({
  DEV: "dev",
  PROD: "prod"
})

const ENV_ID_EXPLICIT_MAP = Object.freeze({
  "cloudbase-d6g0oscry3022da21": ENV_PROFILE.DEV
})

function resolveFunctionEnv(cloudEnvId) {
  if (typeof cloudEnvId !== "string" || cloudEnvId.trim() === "") {
    throw new Error("cloudEnvId is required.")
  }

  const normalized = cloudEnvId.toLowerCase()
  const explicitMatched = ENV_ID_EXPLICIT_MAP[normalized]
  if (explicitMatched) {
    return explicitMatched
  }

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
  ENV_ID_EXPLICIT_MAP,
  resolveFunctionEnv
}
