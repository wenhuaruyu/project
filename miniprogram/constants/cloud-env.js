const CLOUD_ENV_ID_MAP = Object.freeze({
  dev: "cloudbase-d6g0oscry3022da21",
  prod: "guihua-home-prod"
})

function resolveCloudEnvId(appEnv) {
  const envId = CLOUD_ENV_ID_MAP[appEnv]
  if (!envId) {
    throw new Error("Unsupported appEnv. Use dev/prod only.")
  }
  return envId
}

module.exports = {
  CLOUD_ENV_ID_MAP,
  resolveCloudEnvId
}
