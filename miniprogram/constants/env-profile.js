const ENV_PROFILE = Object.freeze({
  DEV: "dev",
  PROD: "prod"
})

const ENV_VERSION_MAP = Object.freeze({
  develop: ENV_PROFILE.DEV,
  trial: ENV_PROFILE.DEV,
  release: ENV_PROFILE.PROD
})

function resolveAppEnv(envVersion) {
  const mapped = ENV_VERSION_MAP[envVersion]
  if (!mapped) {
    throw new Error("Unsupported envVersion. Use develop/trial/release only.")
  }
  return mapped
}

module.exports = {
  ENV_PROFILE,
  resolveAppEnv
}
