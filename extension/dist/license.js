"use strict";
/**
 * 本地自用构建：无卡密、无云端核销；保留与原模块相同的导出签名供 extension.js require。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceCloudLicenseRevocationCheck =
    exports.clearExpiredTrialIfNeeded =
    exports.clearExpiredLicenseIfNeeded =
    exports.clearTrialUntilState =
    exports.clearLicenseState =
    exports.tryStartTrial30 =
    exports.tryActivateLicense =
    exports.tryActivateLicenseAsync =
    exports.getLicenseStatusForWebview =
    exports.formatLicenseExpiry =
    exports.checkLicenseValidity =
    exports.verifyAndParseToken =
    exports.generateLicenseToken =
    exports.getLicenseSecret =
    exports.MAX_LICENSE_DURATION_MS =
    exports.MIN_LICENSE_DURATION_MS =
    exports.TRIAL_DURATION_MS =
    exports.GLOBAL_STATE_TRIAL_USED_KEY =
    exports.GLOBAL_STATE_TRIAL_UNTIL_KEY =
    exports.GLOBAL_STATE_USED_NONCES_KEY =
    exports.GLOBAL_STATE_LICENSE_KEY =
    exports.DEFAULT_LICENSE_SECRET =
        void 0;
exports.DEFAULT_LICENSE_SECRET = "";
exports.GLOBAL_STATE_LICENSE_KEY = "sidecarMcp.license.v1";
exports.GLOBAL_STATE_USED_NONCES_KEY = "sidecarMcp.usedLicenseNonces.v1";
exports.GLOBAL_STATE_TRIAL_UNTIL_KEY = "sidecarMcp.trialUntil.v1";
exports.GLOBAL_STATE_TRIAL_USED_KEY = "sidecarMcp.trialUsed.v1";
exports.TRIAL_DURATION_MS = 0;
exports.MIN_LICENSE_DURATION_MS = 60 * 1000;
exports.MAX_LICENSE_DURATION_MS = 10 * 365 * 24 * 3600 * 1000;
function getLicenseSecret() {
    return "";
}
exports.getLicenseSecret = getLicenseSecret;
function generateLicenseToken() {
    throw new Error("本地构建已禁用卡密生成");
}
exports.generateLicenseToken = generateLicenseToken;
function verifyAndParseToken() {
    return { ok: false, error: "本地构建已禁用卡密" };
}
exports.verifyAndParseToken = verifyAndParseToken;
function checkLicenseValidity() {
    return { valid: true, expiresAt: null, isTrial: false };
}
exports.checkLicenseValidity = checkLicenseValidity;
function formatLicenseExpiry() {
    return "";
}
exports.formatLicenseExpiry = formatLicenseExpiry;
function getLicenseStatusForWebview() {
    return { ok: true, expiresAt: null, label: "" };
}
exports.getLicenseStatusForWebview = getLicenseStatusForWebview;
async function tryActivateLicenseAsync() {
    return { ok: false, msg: "本地构建无需激活" };
}
exports.tryActivateLicenseAsync = tryActivateLicenseAsync;
function tryActivateLicense() {
    return { ok: false, msg: "本地构建无需激活" };
}
exports.tryActivateLicense = tryActivateLicense;
function tryStartTrial30() {
    return { ok: false, msg: "本地构建无需试用" };
}
exports.tryStartTrial30 = tryStartTrial30;
async function clearLicenseState() { }
exports.clearLicenseState = clearLicenseState;
async function clearTrialUntilState() { }
exports.clearTrialUntilState = clearTrialUntilState;
function clearExpiredLicenseIfNeeded() { }
exports.clearExpiredLicenseIfNeeded = clearExpiredLicenseIfNeeded;
function clearExpiredTrialIfNeeded() { }
exports.clearExpiredTrialIfNeeded = clearExpiredTrialIfNeeded;
async function enforceCloudLicenseRevocationCheck() { }
exports.enforceCloudLicenseRevocationCheck = enforceCloudLicenseRevocationCheck;
