/**
 * Copyright (c) 2025 Capital One
*/

import { URL } from 'node:url';
import { getGlobalDispatcher, setGlobalDispatcher, Dispatcher, ProxyAgent } from 'undici';
import { Logger } from 'ods-framework';
const log = new Logger('proxyConfig');


export function setupProxy(_httpProxy?: string, _httpsProxy?: string, _noProxy?: string) {
    log.info('setupProxy()');
    const httpProxy = _httpProxy || process.env.GLOBAL_AGENT_HTTP_PROXY || '';
    const httpsProxy = _httpsProxy || process.env.GLOBAL_AGENT_HTTPS_PROXY || '';
  
    if (!httpProxy && !httpsProxy) {
      log.info('No proxy configuration provided, using default settings.');
      return;
    }

    const httpProxyAgent = new ProxyAgent(httpProxy);
    const httpsProxyAgent = new ProxyAgent(httpsProxy);
    const noProxy = _noProxy || process.env.GLOBAL_AGENT_NO_PROXY || ''
    const noProxyRules = noProxy.split(',').map(rule => rule.trim());
    const defaultDispatcher = getGlobalDispatcher();

    setGlobalDispatcher(new class extends Dispatcher {
    dispatch(options: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandler) {
        if (options.origin) {
        const { host, protocol } = typeof options.origin === 'string' ? new URL(options.origin) : options.origin;
        const proxyAgent = protocol === 'https:' ? httpsProxyAgent : httpProxyAgent;
        if (proxyAgent && !noProxyRules.some(rule => rule.startsWith('.') ? host.endsWith(rule) : host === rule)) {
            return proxyAgent.dispatch(options, handler);
        }
        }
        return defaultDispatcher.dispatch(options, handler);
    }
    });

    // Don't log proxy urls if passed in, since they may contain credentials
    if (!_httpProxy) {
        log.info(`HTTP Proxy: ${httpProxy}`);
        log.info(`HTTPS Proxy: ${httpsProxy}`);
        log.info(`NO_PROXY: ${noProxy}`);
    }
    else {
        log.info(`HTTP Proxy: [REDACTED]`);
        log.info(`HTTPS Proxy: [REDACTED]`);
        log.info(`NO_PROXY: ${noProxy}`);
    }
}