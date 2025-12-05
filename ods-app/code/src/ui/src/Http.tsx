/**
 * Copyright (c) 2025 Capital One
*/

import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import { decompress } from 'lz-ts';
import { getCookie } from './App';

export class AxiosError {
    status: number;
    statusText: string;
    message: string; 

    constructor(e:any) {
        if (e.response) {
            this.status = e.response.status;
            this.statusText = e.response.statusText;
            this.message = e.response.data.message;
        }
        else {
            this.status = 500;
            this.statusText = "Unknown error calling server"
            this.message = "Unknown error calling server"
        }
    }

    getStatus():number {
        return this.status;
    }
    getStatusText():string {
        return this.statusText;
    }
    getMessage():string {
        return this.message;
    }
    toString():string {
        return `Http error: status=${this.getStatus()} statusText="${this.getStatusText()}" message="${this.getMessage()}`;
    }
}

export class Http {
    baseUrl: string;
    auth: any;
    private static instance: Http;
    ctx: any;
    ctxCallback: any;
    accessToken: any;

    constructor(url:string) {
        console.log(`Http(${url})`)
        this.baseUrl = url;
    }

    public static init(baseUrl: string, ctxCallback?: any, username?: string, password?: string): Http {
        if (this.instance !== undefined) {
            return this.instance;
        } 
        this.instance = new Http(baseUrl);
        this.instance.baseUrl = baseUrl;
        this.instance.ctxCallback = ctxCallback;
        if (username !== undefined && password !== undefined) {
            this.instance.auth = {username, password};
        }

        this.instance.accessToken = getCookie("accessToken")
        console.log("accessToken=", this.instance.accessToken);
        
        return this.instance;
    }

    public static getInstance(): Http {
        return this.instance;
    }

    private setBearer(url: string, config?: AxiosRequestConfig<any>) {
        if (!url.startsWith(this.baseUrl)) {
            return config;
        }
        if (this.accessToken) {
            config = {...config, headers: {
                    ...(config?.headers),
                    Authorization: `Bearer ${this.accessToken}`,
                },
                withCredentials: true,
            }
        }
        return config;
    }

    private getCtx(response: any) {
        if (!this.ctx) {
            if (response.headers?.ctx) {
                this.ctx = JSON.parse(response.headers.ctx);
                console.log("SET CTX =", this.ctx);
                if (this.ctxCallback) {
                    this.ctxCallback(this.ctx);
                }
            }
        }
    }   

    public async get(url:string, config?:AxiosRequestConfig<any>):Promise<AxiosResponse<any, any>> {
        console.log(`get(${url})`);
        let _url = url;
        if (!url.startsWith("http")) {
            _url = this.baseUrl + url;
        }
        else {
            config = this.setBearer(_url, config);
        }
        if (this.auth) {
            if (config === undefined) {
                config = {auth: this.auth};
            }
            else {
                config = {...config, auth: this.auth}
            }
        }
        console.log("config=", config);
        try {
            const response = await axios.get(_url, config);
            this.getCtx(response);
            return response;
        } catch (e) {
            throw(e);
        }
    }

    public async getStream(url:string, config?:AxiosRequestConfig<any>, callback?:any, partial=true):Promise<any> {
        console.log(`getStream(${url})`);
        return new Promise(async (resolve, reject) => {
            let _url = url;
            if (!url.startsWith("http")) {
                _url = this.baseUrl + url;
            }
            else {
                config = this.setBearer(_url, config);
            }
            let delimit = "?";
            if (_url.indexOf("?") > -1) {
                delimit = "&"
            }
            let c:AxiosRequestConfig = config ? config : {responseType: 'text'};
            if (this.auth) {
                c = {...c, auth: this.auth}
            }
            try {
                const ret:any = [];
                console.log("axios config =", c);
                let index = 0;
                let len = 0;
                let done = false;
                let charsRead = 0;
                const response = axios.get(_url + delimit + "stream=compress", {...c, onDownloadProgress: (e: any): void => {
                    try {
                        const req = e.event.target as XMLHttpRequest;
                        const chunk = req.responseText;
                        while (true) {
                            if (len == 0 && chunk.length >= index+16) {
                                const slen = chunk.substring(index, index+16);
                                charsRead += 16;
                                if (slen.startsWith("-")) {
                                    done = true;
                                    break;
                                }
                                len = parseInt(slen);
                                index = index + 16;
                            }
                            else if (len > 0 && chunk.length >= index+len) {
                                const str1 = chunk.substring(index, index+len);
                                const str = decompress(str1) || "";
                                charsRead += str1.length;
                                const json = JSON.parse(str);
                                ret.push(json);
                                index = index + len;
                                len = 0;
                                if (partial && callback) {
                                    callback(ret, false);
                                }
                            }
                            else {
                                break;
                            }
                        }
                        if (done) {
                            console.log(">>> charsRead =", charsRead);
                            if (callback) {
                                callback(ret, true);
                                return resolve(ret.length)
                            }
                            return resolve(ret);
                        };
                    } catch (e) {
                        return reject(e);
                    }
                }
                });
                this.getCtx(response);
            } catch (e) {
                reject(e);
            }
        })
    }


    public async post(url:string, data?:any, config?:AxiosRequestConfig<any>):Promise<AxiosResponse<any, any>> {
        console.log(`post(${url})`);
        let _url = url;
        if (!url.startsWith("http")) {
            _url = this.baseUrl + url;
        }
        else {
            config = this.setBearer(_url, config);
        }
        let c:any = config ? config : {headers: {"Content-type": "application/json"}};
        if (this.auth) {
            c = {...c, auth: this.auth}
        }
        try {
            const response = await axios.post(_url, data, c);
            this.getCtx(response);
            return response;
        } catch (e) {
            throw(e);
        }
    }

    public async put(url:string, data?:any, config?:AxiosRequestConfig<any>):Promise<AxiosResponse<any, any>> {
        console.log(`put(${url})`);
        let _url = url;
        if (!url.startsWith("http")) {
            _url = this.baseUrl + url;
        }
        else {
            config = this.setBearer(_url, config);
        }
        let c:any = config ? config : {headers: {"Content-type": "application/json"}};
        if (this.auth) {
            c = {...c, auth: this.auth}
        }
        try {
            const response = await axios.put(_url, data, c);
            this.getCtx(response);
            return response;
        } catch (e) {
            throw(e);
        }
    }

    public async postStream(url:string, data?:any, config?:AxiosRequestConfig<any>, callback?:any, partial=true):Promise<any> {
        console.log(`postStream(${url})`);
        let _url = url;
        if (!url.startsWith("http")) {
            _url = this.baseUrl + url;
        }
        else {
            config = this.setBearer(_url, config);
        }
        let c:AxiosRequestConfig = config ? config : {responseType: 'text', maxRedirects: 0};
        if (this.auth) {
            c = {...c, auth: this.auth}
        }
        try {
            const ret:any = [];
            console.log("axios config =", c);
            let index = 0;
            let len = 0;
            let done = false;
            let charsRead = 0;
            let isPrimative = false;
            const response = await axios.post(_url, {...data, stream:"compress"}, {...c, onDownloadProgress: (e: any): void => {
                try {
                    const req = e.event.target as XMLHttpRequest;
                    console.log(">>postStream: e =",e, "readyState =", req.readyState);
                    const chunk = req.responseText;
                    while (true) {
                        if (len == 0 && chunk.length >= index+16) {
                            const slen = chunk.substring(index, index+16);
                            charsRead += 16;
                            if (slen.startsWith("-")) {
                                done = true;
                                break;
                            }
                            else if (slen.startsWith("$")) {
                                isPrimative = true;
                            }
                            len = parseInt(slen) || 0;
                            index = index + 16;
                        }
                        else if (len > 0 && chunk.length >= index+len) {
                            const str1 = chunk.substring(index, index+len);
                            charsRead += str1.length;
                            const str = decompress(str1) || "";
                            if (isPrimative) {
                                const json = JSON.parse(str);
                                index = index + len;
                                len = 0;
                                if (callback) {
                                    callback(json.value, true);
                                }
                            } else {
                                const json = JSON.parse(str);
                                ret.push(json);
                                index = index + len;
                                len = 0;
                                if (partial && callback) {
                                    callback(ret, false);
                                }
                            }

                        }
                        else {
                            break;
                        }
                    }
                    if (done) {
                        console.log(">>> charsRead =", charsRead);
                        console.log(">>postStream: ret.length =", ret.length);
                        if (callback) {
                            callback(ret, true);
                        }
                        return;
                    };
                } catch (e) {
                    console.log(">>>>> got stream error here: ", e);
                    throw(e);
                }
            }
            });
            this.getCtx(response);
        } catch (e:any) {
            console.log(">>>> error in calling post for stream: ", e)

            // If error, then it is a JSON object, but was received as text, so convert to object & save back to error
            if (e.response?.data) {
                try {
                    const err = JSON.parse(e.response.data);
                    e.response.data = err;
                } catch (eparse) {
                    console.log(">>>> parse error: ", eparse);
                }
            }
            throw(e);
        }
    }

    public async patch(url:string, data?:any, config?:AxiosRequestConfig<any>):Promise<AxiosResponse<any, any>> {
        console.log(`patch(${url})`);
        let _url = url;
        if (!url.startsWith("http")) {
            _url = this.baseUrl + url;
        }
        else {
            config = this.setBearer(_url, config);
        }
        try {
            let c:any = config ? config : {headers: {"Content-type": "application/json"}};
            if (this.auth) {
                c = {...c, auth: this.auth}
            }
            const response = await axios.patch(_url, data, c);
            this.getCtx(response);
            return response;
        } catch (e) {
            throw(e);
        }
    }

    public async delete(url:string, config?:AxiosRequestConfig<any>):Promise<AxiosResponse<any, any>> {
        console.log(`delete(${url})`);
        let _url = url;
        if (!url.startsWith("http")) {
            _url = this.baseUrl + url;
        }
        else {
            config = this.setBearer(_url, config);
        }
        if (this.auth) {
            if (config === undefined) {
                config = {auth: this.auth};
            }
            else {
                config = {...config, auth: this.auth}
            }
        }
        try {
            const response = await axios.delete(_url, config);
            this.getCtx(response);
            return response;
        } catch (e) {
            throw(e);
        }
    }
}
