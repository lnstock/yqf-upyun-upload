import axios from 'axios'

function createReq(endpoint, bucket, authorization, xdate) {
    const req = axios.create({
        baseURL: endpoint + '/' + bucket,
        maxRedirects: 0,
    })

    req.interceptors.request.use((config) => {
        let method = config.method.toUpperCase()
        config.url = encodeURI(config.url)

        config.headers.common = {
            'Authorization': authorization,
            'X-Date': xdate
        }
        return Promise.resolve(config)
    }, error => {
        throw new Error('upyun - request failed: ' + error.message)
    })

    req.interceptors.response.use(
        response => response,
        error => {
            const { response } = error
            if (typeof response === 'undefined') {
                throw error
            }

            if (response.status !== 404) {
                throw new Error('upyun - response error: ' + error.message)
            } else {
                return response
            }
        }
    )
    return req
}

const endpoint = {
    domain: 'v0.api.upyun.com',
    protocol: 'https'
}

export default class upyun {
    static upload(bucket, getHeaderSign, localFile) {
        getHeaderSign(bucket, method).then(sign => {
            var req = createReq(endpoint.protocol + '://' + endpoint.domain, bucket, sign.Authorization, sign.XDate)
            req.put(remotePath, localFile).then(({ headers: responseHeaders, status })=>{
                if (status !== 200) {
                    return Promise.reject(status)
                }

                return Promise.resolve(headers)
            })
        })
    }
}