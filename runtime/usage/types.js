export function isMeteredEndpoint(endpoint) {
    return endpoint === '/data/access' || endpoint === '/payout/execute' || endpoint === '/trust/verify';
}
