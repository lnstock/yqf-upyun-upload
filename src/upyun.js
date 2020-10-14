import axios from 'axios'

function createReq(endpoint, bucket, authorization, xdate) {
    const req = axios.create({
        baseURL: endpoint + '/' + bucket,
        maxRedirects: 0,
    })

    req.interceptors.request.use((request) => {
        request.url = encodeURI(request.url)
        request.headers.common = {
            'Authorization': authorization,
            'X-Date': xdate
        }
        return request
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
    static upload(bucket, localFile, getHeaderSign) {
        return getHeaderSign(bucket, 'PUT', localFile.type).then(sign => {
            var authorization = sign.Authorization || sign.authorization;
            var xDate = sign.XDate || sign.xDate || sign.xdate;
            var path = sign.Path || sign.path;

            var req = createReq(endpoint.protocol + '://' + endpoint.domain, bucket, authorization, xDate)
            return req.put(path, localFile).then(({ headers: responseHeaders, status }) => {
                return Promise.resolve({
                    bucket: bucket,
                    path: path
                })
            })
        })
    }
}