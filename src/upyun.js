import axios from 'axios'

function createReq(endpoint, bucket, remotePath, getHeaderSign) {
    const req = axios.create({
        baseURL: endpoint + '/' + bucket,
        maxRedirects: 0,
    })

    req.interceptors.request.use((config) => {
        let method = config.method.toUpperCase()
        config.url = encodeURI(config.url)

        return getHeaderSign(bucket, method, remotePath).then((headers) => {
            config.headers.common = headers
            return Promise.resolve(config)
        })
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
    static upload(bucket, getHeaderSign, remotePath, localFile) {
        var req = createReq(endpoint.protocol + '://' + endpoint.domain, bucket, remotePath, getHeaderSign)

        return req.put(remotePath, localFile, {
            
        }).then(({ headers: responseHeaders, status }) => {
            if (status !== 200) {
                return Promise.resolve(false)
            }

            let params = ['x-upyun-width', 'x-upyun-height', 'x-upyun-file-type', 'x-upyun-frames']
            let result = {}
            params.forEach(item => {
                let key = item.split('x-upyun-')[1]
                if (responseHeaders[item]) {
                    result[key] = responseHeaders[item]
                    if (key !== 'file-type') {
                        result[key] = parseInt(result[key], 10)
                    }
                }
            })
            return Promise.resolve(Object.keys(result).length > 0 ? result : true)
        })
    }
}