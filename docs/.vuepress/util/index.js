import axios from "axios";
export const hashRE = /#.*$/
export const extRE = /\.(md|html)$/
export const endingSlashRE = /\/$/
export const outboundRE = /^[a-z]+:/i
export let versions = [];

export function isExternal (path) {
    return outboundRE.test(path)
}

export function isMailto (path) {
    return /^mailto:/.test(path)
}

export function isTel (path) {
    return /^tel:/.test(path)
}

export function ensureExt (path) {
    if (isExternal(path)) {
        return path
    }
    const hashMatch = path.match(hashRE)
    const hash = hashMatch ? hashMatch[0] : ''
    const normalized = normalize(path)

    if (endingSlashRE.test(normalized)) {
        return path
    }
    return normalized + '.html' + hash
}

export function normalize (path) {
    return decodeURI(path)
        .replace(hashRE, '')
        .replace(extRE, '')
}

export const getVersions=()=>{
    return new Promise(((resolve, reject) => {
            axios.get(
                'https://api.github.com/repos/huaweicloud/Sermant-website/git/trees/version-support'
            ).then((res) => {
                const versionsNode = res.data.tree.find(e => {
                    return e.path === 'versions.json';
                });
                axios.get(versionsNode.url).then((res) => {
                    versions = JSON.parse(window.atob(res.data.content)).versions;
                    resolve(versions);
                }).catch((err) => {console.error(err)
                    reject()});
            }).catch(err=>{
                console.error(err)
                reject()
            });
        })
    )
}